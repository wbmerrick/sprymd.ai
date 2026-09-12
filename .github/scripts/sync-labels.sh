#!/usr/bin/env bash
# Sync labels from .github/labels.yml into the current GitHub repository.
# Usage:
#   bash .github/scripts/sync-labels.sh           # create/update on GitHub
#   bash .github/scripts/sync-labels.sh --dry-run # print planned actions only
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LABELS_FILE="${ROOT}/.github/labels.yml"
DRY_RUN=0
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

if [[ ! -f "${LABELS_FILE}" ]]; then
  echo "Missing ${LABELS_FILE}" >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required" >&2
  exit 1
fi

parse_labels() {
  python3 - <<'PY' "${LABELS_FILE}"
import sys
path = sys.argv[1]
text = open(path, encoding="utf-8").read()
entries = []
current = {}
for raw in text.splitlines():
    line = raw.split("#", 1)[0].rstrip()
    if not line.strip():
        continue
    if line.lstrip().startswith("- name:"):
        if current.get("name"):
            entries.append(current)
        current = {"name": line.split(":", 1)[1].strip().strip('"').strip("'")}
    elif "color:" in line and current:
        current["color"] = line.split(":", 1)[1].strip().strip('"').strip("'")
    elif "description:" in line and current:
        current["description"] = line.split(":", 1)[1].strip().strip('"').strip("'")
if current.get("name"):
    entries.append(current)
for e in entries:
    print(f"{e['name']}\x1f{e.get('color', 'ededed')}\x1f{e.get('description', '')}")
PY
}

mapfile -t PLANNED < <(parse_labels)
echo "Parsed ${#PLANNED[@]} labels from ${LABELS_FILE}"

if [[ "${DRY_RUN}" -eq 1 ]]; then
  printf 'DRY RUN — planned labels:\n'
  for row in "${PLANNED[@]}"; do
    IFS=$'\x1f' read -r name color description <<<"${row}"
    printf '  - %s (%s) — %s\n' "${name}" "${color}" "${description}"
  done
  exit 0
fi

EXISTING="$(gh label list --limit 200 --json name --jq '.[].name' 2>/dev/null || true)"
CREATED=0
UPDATED=0
FAILED=0

for row in "${PLANNED[@]}"; do
  IFS=$'\x1f' read -r name color description <<<"${row}"
  [[ -z "${name}" ]] && continue
  if printf '%s\n' "${EXISTING}" | grep -Fxq "${name}"; then
    echo "Updating: ${name}"
    if gh label edit "${name}" --color "${color}" --description "${description}" >/dev/null 2>&1; then
      UPDATED=$((UPDATED + 1))
    else
      echo "  ! failed to update ${name}" >&2
      FAILED=$((FAILED + 1))
    fi
  else
    echo "Creating: ${name}"
    if gh label create "${name}" --color "${color}" --description "${description}" >/dev/null 2>&1; then
      CREATED=$((CREATED + 1))
    else
      echo "  ! failed to create ${name} (check Issues/Labels write permission)" >&2
      FAILED=$((FAILED + 1))
    fi
  fi
done

echo "Summary: created=${CREATED} updated=${UPDATED} failed=${FAILED}"
if [[ "${FAILED}" -gt 0 ]]; then
  echo "Label sync incomplete. A repo admin can re-run: bash .github/scripts/sync-labels.sh" >&2
  exit 1
fi

echo "Current labels:"
gh label list --limit 100

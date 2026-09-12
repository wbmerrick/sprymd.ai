---
name: github-issues-workflow
description: "GitHub Issues as the official tracker for SpryMD. Use when triaging bugs, creating issues from reports/specs/meeting notes, searching duplicates, labeling, or generating status reports from GitHub Issues. Prefer gh CLI (and GitHub MCP when available) over Jira/Notion for this repository."
---

# GitHub Issues Workflow

SpryMD’s system of record is **GitHub Issues** in this repository. Do not route work to Jira or Notion unless the user explicitly asks.

## When to use

- Triage a bug report or error message
- Search for duplicates / similar issues
- Create a bug, feature, or chore issue
- Capture action items from notes into issues
- Produce a status report from open/closed issues
- Apply or fix labels per project conventions

## Prerequisites

1. Prefer `gh` against the current repo. If GitHub MCP tools are available and healthy, they may be used equivalently.
2. If `gh issue` returns `Resource not accessible by integration`, stop mutating issues, tell the user the token lacks Issues permission, and still draft the issue body / labels for them to paste.
3. Labels must match [`.github/labels.yml`](../../../.github/labels.yml). Sync with `bash .github/scripts/sync-labels.sh` when labels are missing.

## Label rules

- Always set exactly one `type:*` label.
- After triage, set exactly one `priority:*` label and remove `needs-triage`.
- Set one or more `area:*` labels.
- Use `blocked` / `duplicate` when accurate.

Title prefixes: `[bug]:`, `[feat]:`, `[chore]:` (match issue templates).

---

## Flow A — Triage

### 1. Extract search keys

From the report, pull:

- Error signature (type, code, short message)
- Component / area (`connectors`, `dashboard`, `auth`, …)
- Environment (production / preview / local)
- Observable symptom

### 2. Search duplicates

Run several searches:

```bash
gh issue list --state all --limit 20 --search "KEYWORD1 KEYWORD2"
gh issue list --state open --label "type:bug" --limit 20
gh issue list --state all --label "area:connectors" --search "oauth OR token"
```

If a clear duplicate exists: comment with new context, add useful labels, do **not** create a new issue. Offer to close the new report as duplicate.

### 3. Decide

| Finding | Action |
|---|---|
| Exact duplicate | Comment on existing; link related discussion |
| Related but distinct | Create new issue; reference the related `#N` |
| No match | Create new issue with templates below |
| Already fixed | Comment with fixing PR/commit if known; close if still open |

### 4. Create only when needed

Use **Flow B**. New issues get `needs-triage` only if priority/area are still uncertain; otherwise set full labels immediately.

---

## Flow B — Create issue

### Bug

```bash
gh issue create \
  --title "[bug]: <short symptom>" \
  --label "type:bug,area:<area>,priority:<pN>" \
  --body "$(cat <<'EOF'
### Summary
...

### Steps to reproduce
1. ...

### Expected behavior
...

### Actual behavior
...

### Environment
Production | Staging/preview | Local | Unknown

### Logs / evidence
```
...
```

### Checklist
- [x] Searched for duplicates
- [x] Redacted secrets / PHI
EOF
)"
```

### Feature

```bash
gh issue create \
  --title "[feat]: <outcome>" \
  --label "type:enhancement,area:<area>,priority:<pN>" \
  --body "$(cat <<'EOF'
### Problem / opportunity
...

### Proposed solution
...

### Acceptance criteria
- [ ] ...

### Alternatives considered
...
EOF
)"
```

### Chore

```bash
gh issue create \
  --title "[chore]: <change>" \
  --label "type:chore,area:<area>,priority:<pN>" \
  --body "$(cat <<'EOF'
### Summary
...

### Scope
...

### Done when
- [ ] ...
EOF
)"
```

After create, return the issue URL and applied labels.

### From meeting notes / specs

1. Parse action items (assignee + verb + object).
2. Deduplicate against open issues.
3. Present the planned issue list to the user.
4. Create only after confirmation (unless the user already said “create them”).
5. Prefer one issue per action item; link related issues in the body.

---

## Flow C — Status report

Clarify: project scope (default: this repo), time window (default: last 7 days), audience (exec / team / standup).

```bash
# Open by priority
gh issue list --state open --limit 50

# Recently updated
gh issue list --state all --limit 50 --search "updated:>=YYYY-MM-DD"

# Closed in window
gh issue list --state closed --limit 50 --search "closed:>=YYYY-MM-DD"

# Blocked / P0
gh issue list --state open --label "blocked"
gh issue list --state open --label "priority:p0"
```

Report structure:

1. **Summary** — shipped, in progress, at risk (3–5 bullets)
2. **Completed** — closed issues in window (title + `#N`)
3. **In progress** — open issues with assignees / linked PRs
4. **Blockers** — `blocked` and `priority:p0`
5. **Needs triage** — still labeled `needs-triage`
6. **Asks** — decisions needed

Publish as markdown in chat. Only write to a repo doc/PR comment if the user asks.

---

## Flow D — Link delivery

When implementing:

1. Create a branch / PR that references `Fixes #N` or `Closes #N`.
2. Keep the issue updated with progress comments when blocked.
3. Do not close issues manually if the PR will auto-close them on merge.

---

## Safety

- Never paste tokens, PHI, or `.env` values into issues.
- Do not force-close issues without user intent.
- Do not mass-create issues without showing the plan first.
- Prefer editing labels on an existing issue over opening a near-duplicate.

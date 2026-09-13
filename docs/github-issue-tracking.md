# GitHub Issues — official tracking

SpryMD uses **GitHub Issues** as the system of record for bugs, features, and chores.

## Templates

Open a new issue and pick one of:

| Template | Use for | Default labels |
|---|---|---|
| Bug report | Broken / incorrect behavior | `type:bug`, `needs-triage` |
| Feature request | New capability or improvement | `type:enhancement`, `needs-triage` |
| Chore / maintenance | Tooling, docs, CI, cleanup | `type:chore`, `needs-triage` |

Blank issues are disabled. Security reports go through [Security Advisories](https://github.com/wbmerrick/sprymd.ai/security/advisories/new).

## Label conventions

Canonical definitions live in [`.github/labels.yml`](../.github/labels.yml). Sync to the remote repo:

```bash
bash .github/scripts/sync-labels.sh
```

### Dimensions

- **type:** `bug` | `enhancement` | `chore` | `docs` | `question`
- **priority:** `p0` (blocking) → `p3` (nice to have) — set during triage
- **area:** `frontend` | `backend` | `connectors` | `dashboard` | `auth` | `docs` | `infra` | `ci`
- **status helpers:** `needs-triage` | `blocked` | `duplicate` | `good first issue` | `help wanted`

An issue should usually have **one type**, **one priority** (after triage), and **one or more areas**.

## Triage workflow

1. Confirm it is not a duplicate (`gh issue list --search "..."`).
2. Ensure the correct **type** and **area** labels.
3. Set **priority**.
4. Remove `needs-triage`.
5. Assign an owner when ready to start.
6. Link the implementing PR with `Fixes #N` / `Closes #N`.

## Agent skill

Cursor agents should follow [`.cursor/skills/github-issues-workflow/SKILL.md`](../.cursor/skills/github-issues-workflow/SKILL.md) for triage → create → status-report flows against GitHub Issues.

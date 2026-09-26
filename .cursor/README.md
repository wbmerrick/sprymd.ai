# Cursor setup

This repository keeps shared Cursor guidance in version control so anyone opening the repo in Cursor gets the same project context.

## Shared files

- `.cursor/rules/*.mdc` — shared repo rules loaded by Cursor
- `.cursor/skills/` — shared task-specific skills

## Local-only files

- `.cursor/mcp.json` is intentionally ignored by Git because it can contain machine-specific or secret configuration.

## Recommended startup

1. Open the repository root in Cursor.
2. Use Bun for local commands (`~/.bun/bin/bun` in fresh shells).
3. Start the app with `~/.bun/bin/bun run dev` and use `http://localhost:8080/`.
4. If you need MCP servers locally, create `.cursor/mcp.json` on your machine and keep it uncommitted.

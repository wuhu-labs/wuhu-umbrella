# Wuhu Umbrella

This is the umbrella repo that ties all Wuhu repos together.

## Repo-Specific Context

When working in a particular repo, read that repo's `AGENTS.md` first. It has
build instructions, conventions, and context specific to that package. This
file covers cross-repo concerns only.

(Eventually, Wuhu sessions will support pwd overrides so repo-level AGENTS.md
files are picked up automatically. Not there yet.)

## Repos

| Directory | Repo | Description |
|-----------|------|-------------|
| `wuhu-ai/` | [wuhu-ai](https://github.com/wuhu-labs/wuhu-ai) | PiAI — unified LLM client library |
| `wuhu/` | [wuhu](https://github.com/wuhu-labs/wuhu) | Main server, CLI, runner, integration |

Each repo evolves independently with its own version and release cadence.
The main `wuhu` repo pins stable versions of its dependencies (e.g.,
`wuhu-ai` 0.1.0) and only bumps when explicitly integrating.

## Workspace + Issues

Issues are managed locally at `~/.wuhu/workspace/issues/`. Each issue is a
Markdown file named by its number (e.g., `0001.md`). Use the format
`WUHU-####` (four digits) to reference them.

The workspace lives at `~/.wuhu/workspace/` and contains shared docs,
project plans, and architecture notes alongside issues.

## Getting Started

```bash
# Clone this repo
git clone git@github.com:wuhu-labs/wuhu-umbrella.git
cd wuhu-umbrella

# Sync all child repos
bun sync.ts
```

## Adding a New Repo

1. Add an entry to `repos.yml`
2. Add the directory name to `.gitignore`
3. Run `bun sync.ts`

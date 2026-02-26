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
Markdown file named by its number (e.g., `0041.md`). Use the format
`WUHU-####` (four digits) to reference them. If you see "Fix WUHU-0041",
assume it refers to an issue at that path (not GitHub Issues).

The workspace lives at `~/.wuhu/workspace/` and contains shared docs,
project plans, and architecture notes alongside issues.

## Issue Workflow

When you are assigned to work on a `WUHU-####` issue, you must create a new
branch:

1. If you are already on a new branch that has no changes and has no new
   commits ahead of `main`, assume that branch is for you.
2. If you are in a dirty place (uncommitted changes), stop and ask for human
   intervention.
3. If the current branch (either you created or already present) is behind
   `origin/main`, bring it up to the latest `main` before you start your work.
4. After you finish your work and perform validations, create a PR and make
   sure all checks pass before you finish your work.

## Template Maintenance

This repo is used as a folder-template for Wuhu environments. The child repos
should be pre-cloned so that workspace copies start ready to use.

To refresh the template (pull latest on all child repos):

```bash
bun sync.ts
```

## Adding a New Repo

1. Add an entry to `repos.yml`
2. Add the directory name to `.gitignore`
3. Run `bun sync.ts`

## Collaboration

When the user is interactively asking questions while reviewing code:

- Treat the user's questions/concerns as likely-valid signals, not as "user error".
- Take a neutral stance: verify by inspecting the repo before concluding who's right.
- Correct the user only when there's a clear factual mismatch, and cite the exact
  file/symbol you're relying on.
- Assume parts of the codebase may be sloppy/LLM-generated; prioritize clarity
  and maintainability over defending the status quo.

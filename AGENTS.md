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
| `wuhu-workspace-engine/` | [wuhu-workspace-engine](https://github.com/wuhu-labs/wuhu-workspace-engine) | Workspace scanning and querying |
| `wuhu-core/` | [wuhu-core](https://github.com/wuhu-labs/wuhu-core) | Agent runtime, server, runner, CLI |
| `wuhu-app/` | [wuhu-app](https://github.com/wuhu-labs/wuhu-app) | Native apps (macOS, iOS) |
| `wuhu-markdown-ui/` | [wuhu-markdown-ui](https://github.com/wuhu-labs/wuhu-markdown-ui) | High-performance document & chat rendering engine |
| `wuhu/` | [wuhu](https://github.com/wuhu-labs/wuhu) | Archived — original monorepo |

Each repo evolves independently with its own version and release cadence.
Downstream repos pin stable version tags of their dependencies (e.g.,
`wuhu-ai` 0.1.0) and only bump when explicitly integrating.

## Workspace + Issues

Issues are managed locally at `~/.wuhu/workspace/issues/`. Each issue is a
Markdown file named by its number (e.g., `0041.md`). Use the format
`WUHU-####` (four digits) to reference them. If you see "Fix WUHU-0041",
assume it refers to an issue at that path (not GitHub Issues).

The workspace lives at `~/.wuhu/workspace/` and contains shared docs,
project plans, and architecture notes alongside issues.

## Branching & Merge Strategy

The umbrella repo and the child repos follow different workflows:

### This Repo (wuhu-umbrella)

Direct push to `main`. No branches, no PRs — this is a config/template repo
where fast iteration matters more than review gates. `main` is protected
against force push and deletion to preserve linear history.

### Child Repos (wuhu-ai, wuhu-core, etc.)

All child repos use **branch → PR → squash merge**:

1. Create a feature/fix branch off `main`.
2. Open a PR targeting `main`.
3. Update the PR branch to latest `main` (via `gh api -X PUT
   repos/wuhu-labs/<repo>/pulls/<number>/update-branch` or the GitHub UI).
4. Wait for CI checks to go green.
5. Squash merge (manually or via auto-merge).

When merging, if you discover a repo is missing any of the following, fix it
on the spot using `gh`:

- **Auto-merge not enabled** → `gh repo edit wuhu-labs/<repo> --enable-auto-merge`
- **Stale branches not auto-deleted** → `gh repo edit wuhu-labs/<repo> --delete-branch-on-merge`
- **Squash-only not enforced** → disable other merge methods via the API.
- **Branch protection missing on `main`** → set up a ruleset requiring status
  checks before merge.

## Issue Workflow

Issues live in child repos, not in the umbrella. When assigned to work on a
`WUHU-####` issue in a child repo:

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

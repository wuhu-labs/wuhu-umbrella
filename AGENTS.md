# Wuhu Umbrella

This is the umbrella repo that ties all Wuhu repos together.

## Repos

| Directory | Repo | Description |
|-----------|------|-------------|
| `ai/` | [wuhu-ai](https://github.com/wuhu-labs/wuhu-ai) | PiAI — unified LLM client library |
| `wuhu/` | [wuhu](https://github.com/wuhu-labs/wuhu) | Main server, CLI, runner, integration |

## Getting Started

```bash
# Clone this repo
git clone git@github.com:wuhu-labs/wuhu-umbrella.git
cd wuhu-umbrella

# Sync all child repos
bun sync.ts
```

## Cross-Package Development

During local development, packages can reference each other via relative paths.
For example, `wuhu/Package.swift` can use `path: "../ai"` to point at the local
`wuhu-ai` checkout instead of fetching from GitHub.

In release builds, packages use git URL + version pins.

## Adding a New Repo

1. Add an entry to `repos.yml`
2. Add the directory name to `.gitignore`
3. Run `bun sync.ts`

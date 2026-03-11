# Mount

## Current Problems

1. Mount is a **gate** for bash execution — you must mount before running bash.
   This is an unnecessary restriction.
2. Mount conflates **resource provisioning** (materialization from templates) with
   **working directory selection**. These are unrelated concerns.
3. The mount logic is overly complex due to evolving from a single-machine model
   where multi-machine was bolted on.

## New Model

Mount is **optional, a shorthand, not a gate.**

- You can always run bash with an explicit runner + path.
- Mount sets a default prefix for relative path resolution (the "current working
  directory" concept).
- Primary mount = current cwd. Switching primary mount = switching cwd.

### What mount does:

1. Sets a named alias for a URI prefix so the LLM can use relative paths.
2. Context awareness on mount — the natural window for workspace awareness
   (AGENTS.md, skill index). Undecided whether this is force-injected into
   the context, or emitted as an invitation in the mount tool result that the
   LLM can choose to act on.

### What mount does NOT do:

1. Gate bash or any other tool execution.
2. Provision or create workspaces (that's a separate operation).

## Materialization

Decoupled from mount. Mount as a tool is purely about creating an alias.

The correct tool for provisioning is undecided. It will likely be a separate tool
that handles materialization (or other workspace creation) and then creates the
mount alias as part of its result. For example:

```
create_sandbox({ type: "folder", template: "wuhu-umbrella-linux", ... })
```

(Name is provisional.)

In this model, `mount` is just "create an alias for a URI prefix." Provisioning
tools call mount internally after setting up the workspace.

## Mount Identity

Mounts should have a stable ID (returned on creation), not just an optional name.
This avoids the current mess where mount identity is ambiguous. A primary mount
alias is also useful — set at mount time or switchable later.

## Pre-configured Mounts

User settings can define default mounts that auto-create folders and set cwd.
This removes the "mount first" ceremony for common workflows.

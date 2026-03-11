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
2. Optionally triggers context injection (AGENTS.md, skill index) — the natural
   window for workspace awareness.

### What mount does NOT do:

1. Gate bash or any other tool execution.
2. Provision or create workspaces (that's a separate operation).

## Materialization

Decoupled from mount entirely. Provisioning a workspace from a template is an
admin/setup operation:

- "Create this workspace from this template" → returns a path.
- "Mount this path" → separate step.

They happen in sequence but are not coupled in the same tool call.

## Mount Identity

Mounts should have a stable ID (returned on creation), not just an optional name.
This avoids the current mess where mount identity is ambiguous. A primary mount
alias is also useful — set at mount time or switchable later.

## Pre-configured Mounts

User settings can define default mounts that auto-create folders and set cwd.
This removes the "mount first" ceremony for common workflows.

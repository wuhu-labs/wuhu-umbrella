# Runner and FileIO

## Runner Protocol

The runner protocol is **sound and stays.** Runners talk about paths and machines.
Higher-level concerns (URI resolution, mount aliases, permissions) are resolved on
the server, not in the runner.

Key properties preserved:

- `Runner` is an actor protocol — local and remote implementations.
- Bash is fire-and-forget via `startBash` + push-based `RunnerCallbacks`.
- File IO operations are path-based RPC.
- `RunnerRegistry` tracks live runners (local, declared, incoming).
- `RunnerServerHandler` dispatches requests to the runner implementation.

## FileIO Cleanup

**Problem:** `FileIO` was designed as a process-level dependency (swap FileManager
for testing via `swift-dependencies`). But it leaked into two usage patterns:

1. `@Dependency(\.fileIO)` — correct, pulls from the dependency context.
2. Explicit `fileIO: some FileIO` parameters — incorrect, creates a second channel
   for the same thing.

**Fix:** Use `@Dependency(\.fileIO)` exclusively. Remove all explicit `FileIO`
parameters. The dependency context is set at the scope where the code runs; that's
sufficient.

## Materialization

Decoupled from mount. Materialization is resource provisioning ("create workspace
from template"). It is an admin/setup operation, not part of mount.

The runner's `materialize` method stays (it needs to run on the target machine)
but it is not invoked as part of the mount tool.

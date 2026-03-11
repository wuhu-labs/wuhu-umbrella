# Tool Execution Model

## Two Categories

### Persistent Tools (bash)

Subprocesses that outlive the server process. Managed by workers.

- **No async function representing their lifetime.** There is no long-lived task
  inside the session actor for a bash execution.
- **Event-driven.** Results arrive as external events pushed into the session actor:
  output chunks and final result.
- **Streaming output.** Bash stdout/stderr are streamed in as chunks. Each chunk
  dual-serves as data delivery and heartbeat signal (liveness proof that the
  worker is still watching the process).
- **Explicit kill channel.** Task cancellation does NOT kill the subprocess. An
  explicit kill mechanism (implementation TBD, modeled as a dependency) is used for
  user-initiated interruption.
- **Worker watchdog.** If the worker stops sending heartbeat signals, the tool call
  is marked as failed. The subprocess itself may still be running — "killed" here
  means the tool call is abandoned, not that the process is terminated.
- **Idempotent start.** On session boot, look at tool calls without results. For
  each: either the bash process is still running (re-attach observation) or it
  finished (collect result). If a process for the given tool call ID exists, it
  returns the existing status.

Note: the current "bash tag" naming will likely be replaced. A dedicated tool call
start layer may be introduced, and persistent tool calls would simply be identified
by their tool call ID.

### Non-Persistent Tools (everything else)

Modeled as `() async throws -> ToolResult`.

- **Task cancellation** signals interruption cooperatively.
- **On server crash**, these are gone. On restart, re-run them.
- **Non-idempotent actions** (e.g., web search, external API calls) use a dedicated
  dedupe channel: persist the tool call ID before executing. On crash recovery,
  check the channel to avoid double-firing.

## Interruption

When the user sends a steer message or a notification arrives while tools are
running:

1. The message is queued (steer queue for user messages, notification for system
   events).
2. Steer and notification are conceptually different but behaviorally identical:
   both are drained into the context window when tool results are ready (all
   pending tools complete), before the next inference call.

# Tool Execution Model

## Two Categories

### Persistent Tools (bash)

Subprocesses that outlive the server process.

- **No async function representing their lifetime.** There is no long-lived task
  inside the session actor for a bash execution.
- **Event-driven.** Results arrive as external events pushed into the session actor:
  output chunks (heartbeat + data) and final result.
- **Explicit kill channel.** Task cancellation does NOT kill the subprocess. An
  explicit kill mechanism (implementation TBD, modeled as a dependency) is used for
  user-initiated interruption.
- **Watchdog.** Processes that stop sending heartbeats are killed.
- **Idempotent start.** On session boot, look at tool calls without results. For
  each: either the bash process is still running (re-attach observation) or it
  finished (collect result). `startBash` is already idempotent — if a process for
  the given tag exists, it returns the existing status.

### Non-Persistent Tools (everything else)

Modeled as `() async throws -> ToolResult`.

- **Task cancellation** signals interruption cooperatively.
- **On server crash**, these are gone. On restart, re-run them.
- **Non-idempotent actions** (e.g., web search, external API calls) use a dedicated
  dedupe channel: persist the tool call ID before executing. On crash recovery,
  check the channel to avoid double-firing.

## Interruption (Steer Messages)

When the user sends a steer message while tools are running:

1. The message is queued in the steer queue.
2. When tool results are ready (all pending tools complete), steer messages are
   drained into the context window before the next inference call.

This is unchanged from the current model — just simpler without the persist-first
dance.

## Tool Result Flow

```
External event (bash finished, tool completed)
  → Session actor receives result
  → State updated synchronously
  → Diff emitted to observers
  → Next step in the loop (drain queues, run inference, etc.)
```

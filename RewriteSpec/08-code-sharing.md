# Code Sharing Across Agent Loops

## Two Loop Types

Wuhu supports two fundamentally different agent loop models:

### Standard Agent Loop

Turn-based. User sends a message, LLM responds, tools execute, repeat until idle.
Has steer/followUp queue draining semantics.

### Async Agent Loop

Subscription-based. Subscribes to channels (group chat). Each incoming channel
message triggers the agent to decide what to do — possibly spawn sub-sessions,
respond, or self-compact. Runs indefinitely. No draining semantics.

## Sharing Strategy

**Share the building blocks, not the loop.**

The loops differ in orchestration. Trying to unify them under a single abstraction
(as `EffectLoop` attempted) produces a contract so minimal it doesn't help. The
original `AgentLoop` protocol was an earlier attempt at the same unification with
the same outcome.

Instead, both loops compose from shared components:

### Shared (value types, functions, services)

| Component | What it provides |
|-----------|-----------------|
| `Transcript` | Append-only log, `openToolCalls()`, `needsInference()`, context window projection |
| Inference client | Call LLM, handle streaming, retry with backoff |
| Tool dispatch | Route tool calls to runners, handle results |
| Error handling | Retry logic, cost gates |
| Context window construction | Build the messages array from transcript + settings |
| Persistence observer | Tail state, diff, write to SQLite |

### Not Shared (separate implementations)

| Component | Standard | Async |
|-----------|----------|-------|
| Orchestration loop | Turn-based, queue draining | Subscription-based, channel dispatch |
| Wake conditions | Tool completion, user input | Channel message, timer, sub-session callback |
| Idle semantics | "No more work" → idle | Never truly idle (always subscribed) |
| Compaction trigger | Threshold-based or manual | Self-directed |

# Session Actor

## Design

The session runtime is a Swift actor. It holds all session state in memory.
Mutations are synchronous inside the actor. There is no persist-before-act
requirement.

```
actor SessionActor {
    // State
    var transcript: Transcript       // append-only log
    var steerQueue: MessageQueue     // drained before next inference
    var followUpQueue: MessageQueue  // drained when AI stops calling tools
    var toolState: ToolState         // active tool calls, dedupe tokens
    var inferenceState: InferenceState  // idle/running/retry
    var settings: SessionSettings

    // Observation
    func subscribe() -> AsyncStream<SessionDiff>
}
```

## State Diffing

The `subscribe()` method returns a stream of diffs. Diffs are cheap to compute:

- **Transcript**: track last-flushed index, emit new entries.
- **Queues**: stable IDs, entries immutable once enqueued. Diff is "new IDs since
  last flush."
- **Ephemeral state**: (inference stream, retry timers, bash progress) — snapshot
  compare. These are O(1) in size.

## Consumers

Different consumers attach to the same stream:

| Consumer | What it does |
|----------|-------------|
| **Persistence observer** | Diffs → SQLite writes (async, background) |
| **SSE/WebSocket transport** | Diffs → client notifications |
| **SwiftUI projection** | Mechanical copy to `@Observable` class |
| **Test harness** | Direct state inspection, no DB needed |

## Single-Session In-App Mode

For previews and testing, the session actor runs without the persistence
observer. Same code, same logic — just no SQLite. SwiftUI hooks the actor
directly via the observation projection. This makes sessions fully testable
and previewable without any store setup.

## Dual Isolation

Same session code must work in two contexts:

- **Server**: actor-isolated (own isolation domain)
- **UI**: needs to project to `@MainActor` for SwiftUI

The projection layer handles this: actor state → `AsyncStream<SessionDiff>` →
`@Observable` class on `@MainActor`. The actor never touches MainActor; the
projection bridges the gap.

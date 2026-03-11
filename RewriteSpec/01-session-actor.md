# Session Actor

## Design

The session runtime is a Swift actor. It holds all session state in memory.
Mutations are synchronous inside the actor. There is no persist-before-act
requirement.

The actor publishes its **state directly** via `AsyncStream`. It does not
compute or publish diffs — consumers receive the full state snapshot on each
change. Diffing is a separate concern handled by free functions.

```
actor SessionActor {
    var state: AgentState

    // Publishes the full state on each mutation
    func subscribe() -> AsyncStream<AgentState>
}
```

## Diffing

Two free-form static methods on `AgentState` handle diff and patch:

```swift
static func diff(old: AgentState, new: AgentState) -> AgentPatch
static func apply(patch: AgentPatch, to state: inout AgentState)
```

These are pure functions. Consumers call them as needed — the actor doesn't
know or care about diffing.

## AgentState — Draft Sketch

⚠️ **This is a rough draft, not to be taken seriously. Structure will change.**

```swift
struct AgentState {
    // Transcript
    var transcript: Transcript

    // Queues
    var steerQueue: MessageQueue
    var followUpQueue: MessageQueue

    // Tool tracking
    var toolCallResults: [String: ToolCallResult]  // tool call ID → result

    // Inference
    var lastInferenceError: InferenceError?

    // Session metadata
    var settings: SessionSettings
    var title: String?
    var status: SessionStatus
}
```

No guard tokens for async tasks. The actor manages concurrency through its
isolation — guard tokens were an artifact of the EffectLoop needing to prevent
`nextEffect` from double-scheduling work.

## Consumers

| Consumer | What it does |
|----------|-------------|
| **Persistence observer** | Receives state, diffs against last persisted version, writes changes to SQLite. Swaps in new "persisted version" only after write completes. |
| **SwiftUI / in-app projection** | Receives state, maps + removeDuplicates, updates `@Observable` class. Same path for full app and single-session preview (just without persistence observer attached). |
| **Test harness** | Direct state inspection on the actor, no observers needed |

## Dual Isolation

Same session code must work in two contexts:

- **Server**: actor-isolated (own isolation domain)
- **UI**: needs to project to `@MainActor` for SwiftUI

The projection layer handles this: actor state → `AsyncStream<AgentState>` →
`@Observable` class on `@MainActor`. The actor never touches MainActor; the
projection bridges the gap.

# Lanes — Steer, FollowUp, Notifications

## Definitions

- **Steer messages**: user interruptions delivered while the LLM is working. Drained
  when tool calls complete, before the next inference call. Injected into the context
  window.
- **FollowUp messages**: new user turns. Drained when the LLM stops outputting tool
  calls (turn is complete).
- **Notification messages**: system events delivered while the LLM is working (e.g.,
  async bash completion, child session result, A2A callback). Conceptually different
  from steer (system-originated, not user-originated) but **behaviorally identical**:
  drained when tool calls complete, before the next inference call, injected into
  the context window.

## Queue Properties

- Short (handful of entries at most).
- Stable IDs per entry.
- Entries are immutable once enqueued.
- Diffing: "what IDs are new since last flush" — trivial even with full scan.

## Persistence

Queues are persisted via the same tail-and-diff mechanism as everything else. The
persistence observer sees new queue entries in the diff and writes them.

## No Change in Semantics

The steer/followUp draining model is unchanged from the current implementation.
Notifications are a new lane with steer-identical draining behavior.
The only difference from the current codebase is that queue management is no longer
entangled with persist-first state transitions.

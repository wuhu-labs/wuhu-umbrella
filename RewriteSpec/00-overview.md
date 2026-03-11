# WuhuCore Rewrite — Overview

## Why Rewrite

The current WuhuCore has a fundamental design flaw: **persist-first state management**.
Every state transition must write to SQLite before updating in-memory state, creating
a weak form of bidirectional sync between the database and the in-memory `AgentState`.
This makes the code rigid, hard to extend, and difficult for AI to modify without
introducing subtle sync bugs.

The `EffectLoop` / `AgentBehavior` architecture (a TCA-inspired reducer + priority
ladder) was built to manage the complexity of persist-first. Guard tokens, careful
sequencing, and the priority ladder in `nextEffect` are all compensating for the
inability to "just do things directly." Removing the persist-first constraint removes
most of what the EffectLoop was solving.

## Core Insight

Session state is cheap to diff:

- **Transcript**: append-only log. Diff = "what entries are new since last flush."
- **Queues (steer, followUp)**: short, stable IDs, entries immutable once enqueued.
  Diff = "what IDs are new."
- **O(1) state**: current LLM stream, retry state, bash progress. Small enough
  that diff cost is trivially low. Many of these are still worth persisting for
  crash recovery.

## New Model — Durable Object Style

Inspired by Cloudflare Durable Objects:

1. **Memory is the source of truth.** The session actor holds all state. Mutations
   are synchronous inside the actor. No IO in the critical path.
2. **A tail observer** watches the state, diffs cheaply, and writes to SQLite
   asynchronously.
3. **Consumers observe the persistence observer.** The persistence observer swaps
   in a new version only when it has been persisted. App, API, and SSE clients
   read from this — they get a consistent, crash-safe view without coupling to
   the live actor or querying the database directly.
4. **Non-idempotent actions get dedupe tokens.** Persist a tool call ID before
   executing so crash recovery knows not to re-dispatch. Safe actions (like
   inference) just re-run — a few cents of repeated inference is acceptable.

## Observation Model

The session actor publishes its state via `AsyncStream`. Consumers diff and project
as needed:

- **Persistence observer**: tails the stream, diffs, writes to SQLite.
- **SwiftUI / in-app projection**: mechanical copy from actor state to `@Observable`
  class for UI binding. Uses `map` + `removeDuplicates` — good enough, optimize
  later. For single-session in-app mode (previews, testing), the persistence
  observer is simply not attached. Same actor, same projection, no SQLite needed.

The actor is the single isolation domain. All mutations happen inside it. SwiftUI
actions route to the actor and get projected back. This is informed by TCA 2.0's
isolation model (synchronous state access from effects, no unnecessary async
boundaries) but we are **not** reimplementing TCA. When TCA 2.0 ships, we migrate
onto their primitives.

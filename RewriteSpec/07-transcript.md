# Transcript Model

## Core Properties

The transcript is an **append-only log**. It is the source of truth for all
session history. Entries are identified by position, not by session ID.

## Entry Types

Entries include but are not limited to messages. The log supports **non-message
entries** (markers, metadata, compaction summaries) from the start:

- **User message**
- **Assistant message** (may contain tool calls)
- **Tool result**
- **System input** (e.g., notification delivery)
- **Marker** (scope start, scope end, head rewind, etc.)
- **Compaction summary** (replaces a range for context window purposes)

This extensibility is required for future features (tree-based scoping, fork
points, manual compaction).

## Context Window vs Full History

The persisted transcript is the **complete immutable history.** What goes into
the LLM's context window is a **view** — a projection derived from the full log.
The projection applies:

- Compaction (replace ranges with summaries)
- Scope filtering (skip entries outside active scopes)
- Head position (for rewind scenarios)

These are separate concerns from storage.

## Session ID and Entries

Entries do **not** carry a session ID as part of their identity. Sessions are
identified by their lineage (parent session + fork point). This enables efficient
in-place forking without duplicating entries.

## Shared Value Type

`Transcript` is a value type with operations shared across both the standard
agent loop and the async agent loop:

```swift
struct Transcript {
    var entries: [TranscriptEntry]

    func openToolCalls() -> [ToolCall]
    func needsInference() -> Bool
    mutating func append(_ entry: TranscriptEntry)
    func contextWindow(settings: ContextSettings) -> [Message]
}
```

## Forking

A forked session shares history with its parent up to a fork point (entry index).
Reading the transcript for a forked session: walk up the parent chain, collect
entries up to each fork point, then append the session's own entries. No entry
duplication required.

## Head Rewind (Single Session)

Within a single session, rewinding is recorded as a **marker entry** in the log:
"head moved to entry N." New entries append after the marker. The old branch
remains in the log but is excluded from the context window projection.

For parallel exploration, use session forking instead.

## Manual Compaction

Users can request compaction of a **recent range** (entries N-k to N), not just
the traditional "compact from the top" approach. The compaction summary entry
replaces that range in the context window projection while the full transcript
is preserved.

This is the pragmatic form of tree-based context management — it may eventually
become an explicit scope-start/scope-end mechanism, but manual compaction works
without dedicated RL training.

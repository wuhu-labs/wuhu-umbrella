# Extensibility — Future Features

These features are not shipping in the rewrite. The spec documents them to ensure
the architecture does not block their implementation.

---

## 1. Cross-Session / Sub-Agents

Spawning child sessions for task delegation.

**Two distinct interaction models** (the current tools try to mix both and do
neither well):

| Model | Description | Lifecycle |
|-------|-------------|-----------|
| **One-off task** | Fire, get result, done | Session ends when task completes |
| **Persistent collaborator** | Ongoing back-and-forth, shared context | Session lives until explicitly terminated |

These should feel distinct to the LLM — different tools or clearly different
calling conventions. Architecturally, a child session is just another session
actor. The parent interacts with it via the `join` tool (for one-off) or
messaging primitives (for persistent).

**No architectural blockers.** The session actor model supports both — it's just
a question of tool design.

---

## 2. A2A Protocol Integration

Handing off tasks to external agents (Claude Code, Codex) via structured protocol
instead of shell scripting.

**Current state:** The `coding-offload` skill is pure shell — launch CLI, poll
stdout files, parse output. No structured communication, no mid-execution
observability, no interruption.

**Target state:** External agents are another event source for the session actor.
Whether results come from a local subprocess or a remote agent over A2A, the
session sees the same data flow. A2A provides structured lifecycle (submitted →
working → completed/failed) and discovery.

**From the LLM's perspective:** looks like a one-off task tool. Same interface as
cross-session sub-agents.

**No architectural blockers.** External agent results are just events pushed into
the session actor — same as bash callbacks or child session completions.

---

## 3. Code Mode (Monty)

LLM writes Python code that calls tools as functions. Monty (Pydantic's sandboxed
Python interpreter in Rust) executes it, suspending on external function calls for
Wuhu to perform the actual IO.

**Benefits:** One inference round-trip → multiple tool calls orchestrated by code.
More efficient than sequential tool calling.

**Design decisions:**

- Code mode is **non-persistent**. If the server crashes mid-execution, it's lost.
  For persistent work, use bash.
- Tools exposed as Monty external functions with type stubs.
- Monty supports REPL mode (`feed()`) for stateful sessions — tabled for later.
- Rust-to-C FFI is straightforward for integration.

**No architectural blockers.** Code mode is a tool call from the LLM's perspective.
The external function calls within it go through the same runner protocol. The
session actor doesn't care where tool invocations originate.

---

## 4. set_session_title

LLM-callable tool to set the session title. Currently users rename sessions
manually in the app.

Simple tool, no architectural considerations. May eventually be enhanced with
implicit title generation (e.g., branching the conversation internally to ask
for a title), but for now it's an explicit tool call.

---

## 5. Tree-Based Context Management (Experimental)

Declare scope start/end markers in the transcript, with compaction at scope close.

**Pragmatic alternative:** Manual compaction of recent message ranges (N-k to N)
by user request. Works without dedicated RL training. The experimental scope
markers can layer on top later.

**Architectural requirement:** Transcript supports non-message entries (markers,
summaries). This is already specified in the transcript model.

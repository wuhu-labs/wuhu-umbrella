# Join Tool

## Problem

`async_bash` was designed to let the LLM launch long-running commands and stay
responsive. But without a structured way to wait for results, LLMs fall back to
sleep-based blocking polls (`bash sleep 10 && check`), which defeats both goals:

1. **Responsiveness** — the LLM is stuck in a sleep loop.
2. **Token efficiency** — each poll iteration burns tokens.

## Design

`join` is a **placebo tool** — a suspension point. It doesn't compute anything or
go to a runner. It tells the session: "I have nothing to do, wake me when something
interesting happens."

### Invocation

```
join()   # no required arguments — just "I'm waiting"
```

### Wake Sources

The join tool completes (returns a result) when any of these fire:

| Source | Example |
|--------|---------|
| **Notification** | Bash process finished, async task completed |
| **Steer message** | User sends a message while the LLM is waiting |
| **Child session** | A spawned sub-session completes or sends a callback |
| **A2A callback** | A remote agent returns a result |

The result of the join call packages whatever arrived — the LLM sees it as a
normal tool result and continues.

### Special Handling

This tool is **not dispatched to a tool executor.** It is handled specially by
the session actor:

1. LLM calls `join`.
2. Session actor recognizes it, suspends the turn.
3. Actor waits on its event sources.
4. First event arrives → packaged as the join tool result.
5. Turn resumes with the result.

## Replaces

- `async_bash` polling patterns
- Sleep-based status checks
- The confusingly-named "urgent-system" message delivery

# URI System

## Principle

Every resource in the Wuhu system has a URI. The URI is the universal addressing
scheme for all tools and programmatic access.

## Scheme

```
wuhu:///<type>/<path>           # local server (empty authority)
wuhu://<server>/<type>/<path>   # remote server (for future multi-server)
```

Three slashes (`wuhu:///`) for local resources — empty authority means "this server,"
following the `file:///` convention. Non-empty authority identifies a remote Wuhu
server for future multi-server interplay.

## Resource Types

| Type | URI pattern | Description |
|------|------------|-------------|
| **Runner filesystem** | `wuhu:///runner/<runner-name>/<absolute-path>` | Files on a specific runner's machine |
| **Workspace** | `wuhu:///workspace/<relative-path>` | Wuhu workspace directory |
| **Blob (CAS)** | `wuhu:///blob/<content-hash>` | Content-addressed storage |

Multiple URIs may resolve to the same physical resource (e.g., a workspace file is
also accessible via its runner path). This is acceptable — same as two machines
mounting the same SMB share.

## Tool Capabilities by Scheme

| Tool | runner | workspace | blob |
|------|--------|-----------|------|
| read | ✓ | ✓ | ✓ |
| write | ✓ | ✓ | ✗ (use `put`) |
| edit | ✓ | ✓ | ✗ |
| ls | ✓ | ✓ | ✗ |
| find | ✓ | ✓ | ✗ |
| grep | ✓ | ✓ | ✗ |
| put | — | — | ✓ (returns hash) |

Blob is read-only by key, write-only via `put` which respects CAS invariants.
Direct bash access to blob storage is prohibited to protect CAS invariants.

## Future: Permissions

Eventually, workspace access may be gated (user can explicitly allow LLM access).
Workspace may also move to a database for change tracking and serialized access.
The URI scheme supports this — permission checks happen at the resolution layer,
not in the URI itself.

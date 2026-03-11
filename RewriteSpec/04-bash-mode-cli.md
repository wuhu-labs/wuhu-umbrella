# Bash-Mode CLI (wuhu-in-bash)

## Problem

URIs are meaningless to standard Unix tools inside a bash subprocess. We need a
bridge so scripts can read/write Wuhu resources programmatically.

## Design

A `wuhu` CLI that runs inside the bash environment, communicating back to the Wuhu
server via a special env var (socket path, port, or token — implementation TBD).

## Primitives

Designed to feel as Unix-native as possible:

```bash
wuhu cat <uri>                     # read to stdout
wuhu cat <uri> <uri> ...           # concatenate multiple (like real cat)
echo "content" | wuhu put <uri>    # write from stdin, silent (sink)
echo "content" | wuhu tee <uri>    # write from stdin, passthrough to stdout
wuhu ls <uri>                      # list directory
wuhu find <uri> -name '*.swift'    # find files
wuhu grep <pattern> <uri>          # search file contents
```

Everything is stdin/stdout. URIs go where paths would go. Tools compose with pipes.

## Copy and Sync

```bash
wuhu cp <src-uri> <dst-uri>        # one-shot copy (recursive for dirs)
wuhu sync <src-uri> <dst-uri>      # rsync-style delta transfer
```

`cat <uri> | put <uri>` works for simple cases but streams through the bash
process. Built-in `cp`/`sync` can go server-side for direct runner-to-runner
transfer, skipping the subprocess. Optimization for later — composable piping
works first.

## Connection to Server

An environment variable provides the connection info for the `wuhu` CLI to talk
back to the server. Implementation details (Unix socket, TCP port, auth token)
are deferred.

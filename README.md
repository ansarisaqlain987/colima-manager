# Colima Manager

A browser UI for managing Docker on [Colima](https://github.com/abiosoft/colima): containers (start/stop/restart/pause/remove, logs, shell), images (pull/remove/prune), volumes, networks, plus a terminal with the Docker CLI — all in the browser. A Rust backend talks to Docker; a React app shows everything.

> Before making any changes, read `AGENTS.md`. It is the single source of truth for repository conventions, skills, and workflow.

## Quick Start

```bash
make install   # frontend node_modules + Rust crates (needs pnpm and Rust)
make up
```

`make up` builds and starts both services and prints:

```text
✅ Application started on port : 1420  →  http://localhost:1420
```

| Command               | What                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| `make up`             | Build and start everything                                                         |
| `make down`           | Stop containers                                                                    |
| `make clean`          | Delete node_modules, dist, .tanstack and Rust target                               |
| `make install`        | Install dependencies: `pnpm install` + `cargo fetch`                               |
| `make colima-start`   | Start Colima (optional `CPU=`, `MEMORY=` GiB, `DISK=` GiB, `RUNTIME=`, `PROFILE=`) |
| `make colima-stop`    | Stop Colima (also stops the app)                                                   |
| `make colima-restart` | Stop + start Colima, applying any new `CPU` / `MEMORY` / `DISK`                    |
| `make colima-status`  | Show whether Colima is running                                                     |
| `make colima-ssh`     | Open a shell inside the Colima VM                                                  |
| `make colima-list`    | List Colima profiles with CPU / memory / disk                                      |

Colima resources are optional variables; omit them to keep the current settings:

```bash
make colima-start CPU=4 MEMORY=8 DISK=100        # first start / start with these resources
make colima-restart CPU=6 MEMORY=12              # change resources of the running VM
make colima-status PROFILE=work                  # any target accepts PROFILE (default: default)
```

Disk size can only grow, never shrink.

Logs: `docker compose logs -f rust-backend` (or `vite-frontend`).

## How It Works

```text
browser ──► vite-frontend :1420 ──/api (HTTP + WebSocket)──► rust-backend :8080 ──► docker CLI ──► Colima's Docker
```

- **rust-backend** (`apps/rust-backend`) — axum server in a container with Colima's Docker socket mounted. REST endpoints for containers, images, volumes, networks and system info; WebSockets for live logs and interactive terminals (a PTY running `docker exec` or a bash shell with the Docker CLI).
- **vite-frontend** (`apps/vite-frontend`) — React + TanStack Router/Query/Table + shadcn/ui. The Vite dev server proxies `/api` to the backend.

The backend runs inside Colima, so it can manage Docker but cannot start or stop Colima itself.

### Security

The terminal gives root-level access to the Colima VM, so:

- the UI is published on `127.0.0.1` only (not your network),
- the backend isn't published at all, and
- it rejects any request whose `Origin` isn't the app, so other websites open in your browser can't use it.

## Repo Overview

```text
.
├── apps/
│   ├── rust-backend/    # axum API (Cargo.toml, src/, Dockerfile)
│   └── vite-frontend/   # React UI (package.json, src/routes, Dockerfile)
├── docker-compose.yml
├── Makefile
└── AGENTS.md
```

## Development Without Docker

```bash
# backend (needs Rust and a working `docker` CLI)
cd apps/rust-backend && cargo run          # http://127.0.0.1:8080

# frontend
cd apps/vite-frontend && pnpm install && pnpm dev   # http://localhost:1420
```

Frontend scripts: `pnpm build`, `pnpm lint`, `pnpm check`, `pnpm format`.

## Where to Look First

Read `AGENTS.md` before doing anything else in this repository. It contains the repo-specific guidance for skills, conventions, and workflow.

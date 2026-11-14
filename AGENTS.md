# Colima Manager — Agent Notes

## Tech Stack

- **rust-backend** — Rust (axum 0.8, tokio, portable-pty). HTTP + WebSocket API that drives the `docker` CLI
- **vite-frontend** — React 19 + TypeScript 6 + Vite 8, TanStack Router (folder-based), TanStack Query + axios, TanStack Table, Tailwind CSS 4 + shadcn/ui, Zustand (client-only UI state), xterm.js

Browser-only app — there is no desktop/Tauri build anymore.

## Commands

### Docker (repo root) — the normal way to run it

| Command               | What                                                                               |
| --------------------- | ---------------------------------------------------------------------------------- |
| `make up`             | Build + start `rust-backend` and `vite-frontend`, print the port                   |
| `make down`           | Stop containers                                                                    |
| `make clean`          | Delete `node_modules`, `dist`, `.tanstack` and Rust `target/`                      |
| `make install`        | `pnpm install` (vite-frontend) + `cargo fetch` (rust-backend)                      |
| `make colima-start`   | Start Colima (optional `CPU=`, `MEMORY=` GiB, `DISK=` GiB, `RUNTIME=`, `PROFILE=`) |
| `make colima-stop`    | Stop Colima (also stops the app)                                                   |
| `make colima-restart` | Stop + start Colima, applying any new `CPU` / `MEMORY` / `DISK`                    |
| `make colima-status`  | Show whether Colima is running                                                     |
| `make colima-ssh`     | Open a shell inside the Colima VM                                                  |
| `make colima-list`    | List Colima profiles with CPU / memory / disk                                      |

### Frontend (run from `apps/vite-frontend/`)

All commands use **pnpm** (12.18.0, pinned via `packageManager`). Do not substitute npm/yarn.

| Command       | What                                                   |
| ------------- | ------------------------------------------------------ |
| `pnpm dev`    | Vite dev server on 1420; proxies `/api` to the backend |
| `pnpm build`  | `tsc && vite build`                                    |
| `pnpm lint`   | ESLint (TanStack config)                               |
| `pnpm check`  | Prettier check                                         |
| `pnpm format` | ESLint fix, then Prettier write                        |

### Backend (run from `apps/rust-backend/`)

`cargo run` (listens on 127.0.0.1:8080), `cargo test`, `cargo fmt`, `cargo clippy --all-targets -- -D warnings`. Rust isn't installed on the host by default — use `docker run --rm -v "$PWD":/app -w /app rust:1-bookworm cargo …` or `make up`.

Run AURQA, see the tables above.

## Structure

Monorepo — both apps live under `apps/`:

### `apps/rust-backend/src/` (mirrors the frontend layout)

- `main.rs` — startup; `config.rs` — env settings (`BIND_ADDR`, `ALLOWED_ORIGINS`); `app.rs` — merges every feature router under `/api` and adds middleware
- `features/<feature>/` — one folder per resource (`system`, `containers`, `images`, `volumes`, `networks`, `terminal`), like the frontend's `routes/<page>/`:
  - `routes.rs` — that feature's paths (`pub fn router()`), re-exported from `mod.rs`
  - `handlers.rs` — HTTP layer: extract, validate (`docker::validate_ref` on every user-supplied ID/name), respond
  - `service.rs` — the `docker` CLI calls (the backend's `api.ts`)
  - `models.rs` — request bodies / query structs / enums
  - extras where needed: `containers/logs.rs` (WebSocket `docker logs --follow`), `terminal/pty.rs` (WebSocket PTY session)
- `common/` — shared code, like the frontend's `lib/`: `error.rs` (`ApiError`/`ApiResult`), `docker.rs` (CLI runner + `validate_ref`), `middleware.rs` (Origin check — keep it on every route, WebSockets bypass CORS), `response.rs` (`ok()` / `ok_with_output()`)
- `Dockerfile` — multi-stage; runtime image has the Docker CLI and bash

### `apps/vite-frontend/src/`

- `routes/` — **folder-based routing**: each page is a folder with `index.tsx` (e.g. `routes/containers/index.tsx` → `/containers`, `routes/containers/$containerId/index.tsx` → `/containers/:id`). `__root.tsx` = sidebar layout, Toaster, devtools. `routeTree.gen.ts` is generated — never edit it
- `routes/<page>/_lib/` — the page's private code, ignored by the router (`routeFileIgnorePattern: '^_lib$'`):
  - `_lib/api/api.ts` — `export const` async functions calling `apiClient`, each wrapped in `try/catch` that rethrows `ApiError.from(error, '<context>')`
  - `_lib/api/hooks.ts` — `export const useXQuery = () => useQuery(…)` and `useXMutation` hooks with inline query keys (`queryKey: ['containers', 'list']`; invalidate with `queryClient.invalidateQueries({ queryKey: ['containers'] })`, no key factories, no `void`); mutations use `onSuccess` (success toast + invalidate) and `onError` (`console.error` + error toast) via `useToast`. Pages destructure: `const { data: containers = [], isPending, error } = useContainersQuery()`
  - `_lib/components/` — page components (tables are configs for `DataTable`)
  - `_lib/utils/` — page helpers / Zustand UI stores (e.g. `containersUiStore.ts`)
- `api/` — app-wide API (health) following the same `api.ts` / `hooks.ts` pattern
- `components/ui/` — shadcn/ui primitives (`pnpm dlx shadcn@latest add <name>`, then replace any `from "cn"` import with `@/lib/utils` and run `pnpm format`)
- `hooks/` — `use-mobile.ts` (shadcn), `use-toast.ts` (`successToast` / `errorToast`), `use-theme.ts`; `components.json` points the shadcn `hooks` alias here
- `components/ThemeProvider.tsx` + `components/ModeToggle.tsx` — theming per https://ui.shadcn.com/docs/dark-mode/vite (light / dark / system, stored under `vite-ui-theme`)
- `components/common/` — reusable wrappers: `AppDialog`, `AppTooltip`, `ConfirmDialog`, `PageHeader`, `ErrorBanner`, `RefreshButton`
- Loading states use shadcn `Skeleton` (`DataTable` `loading` prop renders skeleton rows; pages have their own skeletons, e.g. `OverviewSkeleton`) — no spinners for page loads
- `components/DataTable/` — config-driven TanStack Table: pass `columns`, `rowActions` (single row; inline or menu, optional `confirm`/`loading`), `bulkActions` (multi-row, enables selection), `search`, `pagination` and `loading` as arrays/objects
- `components/AppSidebar.tsx`, `components/Terminal.tsx` (xterm over WebSocket)
- `lib/` — `apiClient.ts` (`ApiClient` class: axios instance, base URL `/api`, request/response interceptors, `ApiError`), `queryClient.ts`, `ws.ts` (`wsUrl`), `bulk.ts`, `utils.ts` (`cn` = clsx + tailwind-merge), `format.ts`, `errors.ts`
- `types.ts` — API response types (Docker CLI JSON field names)
- Import alias `@/` → `src/`; inside a route folder prefer relative imports. Style with Tailwind classes. Don't create a folder for a single file

### Root

- `docker-compose.yml` — `rust-backend` (Docker socket mounted, not published) + `vite-frontend` (published on `127.0.0.1:1420`, `BACKEND_URL=http://rust-backend:8080`)
- `Makefile`, `.github/workflows/ci.yaml` (builds both images, lints/builds the frontend)

## Skills

Custom OpenCode skills live under `.skills/`. Load them with `skill` tool when their trigger condition is met.

| Skill             | Trigger                                            | Key behavior                                                                                                                                         |
| ----------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.skills/code-commit/`   | User says "commit", "stage and commit", etc.       | Commits with Conventional Commits format (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`). Subject under 72 chars, imperative voice.    |
| `.skills/pull-request/`  | User says "create a PR", "open pull request", etc. | Uses `gh create/edit`. Always targets `main`. If one PR exists for the branch, updates its description. If multiple exist, asks which one to update. |
| `.skills/publish-release/` | User says "publish release", "create release", "draft release", etc. | Creates GitHub release drafts with local build artifacts using `gh`. Never publishes without explicit confirmation, and verifies auth, remote, tag, and assets. |

## Key Details

- **No code comments** of any kind (no `//`, `///`, `//!`, JSDoc, section dividers) in Rust, TypeScript or config files

- Port **1420** (Vite, `vite.config.ts`); backend **8080** inside the compose network only
- Security: the terminal is root-equivalent on the Colima VM. Keep the UI bound to localhost and keep the backend's `Origin` check
- The backend runs inside Colima, so it can manage Docker but cannot start/stop Colima itself
- TypeScript: `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (use `import type`)
- TanStack Table is pinned to v8 (v9 has a different API)

# Colima Manager — Agent Notes

## Tech Stack

Tauri 2 + React 19 + TypeScript 5.8 + Vite 7

## Commands

All commands use **pnpm** (referenced in `tauri.conf.json` scripts). Do not substitute npm/yarn.

| Command | What |
|---|---|
| `pnpm dev` | Vite dev server only (port 1420) |
| `pnpm tauri dev` | Full Tauri desktop app (runs `pnpm dev` under the hood) |
| `pnpm build` | `tsc && vite build` |
| `pnpm tauri build` | Builds and packages the desktop app |

Run AURQA, see the table above.

## Structure

- `src/` — React frontend. Entry: `main.tsx` → `App.tsx`
- `src-tauri/` — Rust backend. Entry: `main.rs` → calls `colima_manager_lib::run()` in `lib.rs`
- `src-tauri/src/lib.rs` — Tauri builder + commands. Add `#[tauri::command]` functions here; register via `generate_handler![]`
- `src-tauri/tauri.conf.json` — app config. Frontend dist: `../dist`, dev port: 1420
- `src-tauri/capabilities/default.json` — capability permissions for the main window

## Skills

Custom OpenCode skills live under `.skills/`. Load them with `skill` tool when their trigger condition is met.

| Skill | Trigger | Key behavior |
|---|---|---|
| `code-commit` | User says "commit", "stage and commit", etc. | Commits with Conventional Commits format (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`). Subject under 72 chars, imperative voice. |
| `pull-request` | User says "create a PR", "open pull request", etc. | Uses `gh create/edit`. Always targets `main`. If one PR exists for the branch, updates its description. If multiple exist, asks which one to update. |

## Key Details

- Frontend port is **1420** (hardcoded in `vite.config.ts` and `tauri.conf.json`), not the default 5173
- Vite ignores `src-tauri/**` for file watching (`.tauri dev` only)
- Tauri dev host can be overridden via `TAURI_DEV_HOST` env var
- TypeScript: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- The Rust crate name is `colima_manager_lib` (the underscored lib name in Cargo.toml) — it differs from the package name `colima-manager`

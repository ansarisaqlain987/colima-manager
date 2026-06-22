# Colima Manager

A desktop application for managing [Colima](https://github.com/colima-dev/colima) (Container Linux on macOS) built with Tauri 2, React 19, and TypeScript.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Tauri 2](https://tauri.app/) |
| **UI** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 7](https://vitejs.dev/) |
| **Backend** | Rust |

## Project Structure

```
├── src/                          # React frontend
│   ├── main.tsx                  # Entry point
│   └── App.tsx                   # Root component
├── src-tauri/                    # Rust backend (Tauri)
│   ├── src/
│   │   ├── main.rs               # Rust entry point
│   │   └── lib.rs                # Tauri builder + commands
│   ├── tauri.conf.json           # Tauri configuration
│   └── capabilities/default.json # App permissions
└── public/                       # Static assets
```

- **`src/`** — React frontend. Entry: `main.tsx` → `App.tsx`
- **`src-tauri/`** — Rust backend. Entry: `main.rs` → calls `colima_manager_lib::run()` in `lib.rs`
- **`src-tauri/src/lib.rs`** — Tauri builder + commands. Add `#[tauri::command]` functions here; register via `generate_handler![]`
- **`src-tauri/tauri.conf.json`** — App config. Frontend dist: `../dist`, dev port: 1420
- **`src-tauri/capabilities/default.json`** — Capability permissions for the main window

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (with [pnpm](https://pnpm.io/))
- [Rust](https://www.rust-lang.org/tools/install)
- [Xcode](https://developer.apple.com/xcode/) (macOS)

### Installation

```bash
pnpm install
```

### Available Scripts

All commands use **pnpm**. Do not substitute npm/yarn.

| Command            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `pnpm dev`         | Start Vite dev server only (port **1420**)            |
| `pnpm tauri dev`   | Full Tauri desktop app (runs `pnpm dev` under the hood) |
| `pnpm build`       | Build for production (`tsc && vite build`)            |
| `pnpm tauri build` | Build and package the desktop app                     |
| `pnpm build:macos` | Build macOS DMG installer (`--bundles dmg`)           |
| `pnpm lint:check`  | Check linting and formatting                          |
| `pnpm lint:fix`    | Fix linting and formatting issues                     |

### Key Details

- Frontend dev server runs on port **1420** (not the default 5173)
- Vite ignores `src-tauri/**` for file watching during `tauri dev`
- Tauri dev host can be overridden via `TAURI_DEV_HOST` environment variable
- TypeScript is configured with `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`
- The Rust library crate is named `colima_manager_lib` (differs from the package name `colima-manager`)

## Commit & Pull Request Workflow

Commits and PRs are handled by OpenCode skills located in `.skills/`. It is not required to invoke them manually, but you can explicitly request `code-commit` or `pull-request` if you want to control the process.

| Skill                 | What it does                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `.skills/code-commit/`  | Commits changes with a [Conventional Commits](https://www.conventionalcommits.org/) message |
| `.skills/pull-request/` | Creates or updates a PR to `main` via GitHub CLI (`gh`)                                     |

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

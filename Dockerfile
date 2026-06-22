FROM nailyudha/tauri:latest

WORKDIR /home/nonroot

COPY ./package.json ./pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@11 --activate && pnpm install --frozen-lockfile

COPY . .

# For building Linux (Support for AMD64 & ARM64)
RUN pnpm tauri build

# For building Android (Support only for AMD64)
# RUN pnpm tauri android init \
#     && pnpm tauri android build --apk

# For building Windows
## AMD64
# RUN pnpm tauri build --runner cargo-xwin --target x86_64-pc-windows-msvc
## ARM64
# RUN pnpm tauri build --runner cargo-xwin --target aarch64-pc-windows-msvc
# CI will run linters and checks inside a container that bind-mounts the workspace.
# Tools (Node, pnpm, Rust, Tauri CLI) are installed above for runtime checks.

ENTRYPOINT ["/bin/bash"]

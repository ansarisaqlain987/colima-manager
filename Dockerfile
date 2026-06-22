FROM nailyudha/tauri:latest

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install pnpm@11
RUN npm install -g pnpm@11.8.0

WORKDIR /home/nonroot

COPY ./package.json ./pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --allow-scripts

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

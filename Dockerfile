FROM nailyudha/tauri:latest

# Rust
RUN rustup toolchain install 1.96.1 && \
    rustup default 1.96.1

# System dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get update && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# pnpm
RUN npm install -g pnpm@11.8.0

WORKDIR /workspace

# Copy dependency manifests first (better cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy source
COPY . .

# Rust dependency cache
COPY src-tauri/Cargo.toml src-tauri/Cargo.lock ./src-tauri/
RUN cargo fetch --manifest-path src-tauri/Cargo.toml

# Verification pipeline
RUN pnpm lint:check
RUN pnpm build

RUN cd src-tauri && cargo fmt --all --check
RUN cd src-tauri && cargo clippy --all-targets --all-features -- -D warnings
RUN cd src-tauri && cargo check --all-targets --all-features

# Full Tauri build validation (without installers)
RUN pnpm tauri build --no-bundle
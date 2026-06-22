# Dockerfile for building colima-manager (Linux Tauri app)
# Based on Ubuntu 22.04 to match current CI matrix

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_VERSION=24
ENV PNPM_VERSION=11

# Install common deps
RUN apt-get update && apt-get install -y --no-install-recommends \
  curl \
  ca-certificates \
  build-essential \
  git \
  python3 \
  python3-pip \
  pkg-config \
  libglib2.0-dev \
  libwebkit2gtk-4.0-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf \
  cmake \
  gnupg2 \
  && rm -rf /var/lib/apt/lists/*

# Install Node.js 24.x
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - \
  && apt-get install -y nodejs \
  && node --version

# Install corepack and pnpm
RUN corepack enable \
  && corepack prepare pnpm@11 --activate \
  && pnpm --version

# Install Rustup and toolchain
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup default stable && rustup component add rustfmt clippy

# Install Tauri CLI globally
RUN npm install -g @tauri-apps/cli

# Create workdir and copy project files
WORKDIR /workspace
COPY . /workspace

# Image provides the build environment only; do not execute project builds at image build time.
# CI will run linters and checks inside a container that bind-mounts the workspace.
# Tools (Node, pnpm, Rust, Tauri CLI) are installed above for runtime checks.

ENTRYPOINT ["/bin/bash"]

FROM nailyudha/tauri:latest

RUN rustup toolchain install 1.96.1 && \
    rustup default 1.96.1

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11.8.0

WORKDIR /home/nonroot

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm tauri build --no-bundle

ENTRYPOINT ["/bin/bash"]
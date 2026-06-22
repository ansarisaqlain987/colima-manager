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
RUN pnpm install --frozen-lockfile

COPY . .

# For building Linux (Support for AMD64 & ARM64)
RUN pnpm tauri build

ENTRYPOINT ["/bin/bash"]

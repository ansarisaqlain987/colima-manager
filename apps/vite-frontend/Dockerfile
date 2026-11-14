FROM node:24-bookworm-slim

ENV CI=true
RUN npm install -g pnpm@12.18.0

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 1420

CMD ["pnpm", "dev", "--host", "0.0.0.0"]

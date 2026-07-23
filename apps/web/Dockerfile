FROM node:20-alpine AS dependencies
WORKDIR /workspace
RUN corepack enable && corepack prepare pnpm@9.15.5 --activate
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/config/package.json ./packages/config/package.json
RUN pnpm install --frozen-lockfile --filter @vaultx/web...

FROM dependencies AS builder
COPY apps/web ./apps/web
COPY packages/config ./packages/config
RUN pnpm --filter @vaultx/web build

FROM nginx:1.27-alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/apps/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]

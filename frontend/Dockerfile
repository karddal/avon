FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_CDN_URL=https://cdn.avon.ac

RUN bun run build

# ---- Runner ----
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_API_URL=https://localhost:8000
ENV NEXT_PUBLIC_CDN_URL=https://cdn.avon.ac

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
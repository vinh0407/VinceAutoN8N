FROM node:24-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm approve-builds --all && pnpm install

COPY backend ./backend
COPY frontend ./frontend

RUN pnpm --filter vinceauto-frontend build
RUN pnpm --filter vinceauto-backend build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@12.18.0

COPY package.json pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

RUN pnpm approve-builds --all && pnpm install --prod

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 5678

CMD ["node", "backend/dist/index.js"]

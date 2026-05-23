
# ── Stage 1: Install dependencies ──────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Run tests ─────────────────────────────────────────────────
FROM deps AS test
COPY . .
ENV CI=true
RUN npm test -- --ci --coverage

# ── Stage 3: Build production bundle ───────────────────────────────────
FROM deps AS builder
COPY . .
RUN npm run build

# ── Stage 4: Production image (nginx) ──────────────────────────────────
FROM nginx:alpine AS production
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 3000
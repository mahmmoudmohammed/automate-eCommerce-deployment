FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS test
COPY . .
ENV CI=true
RUN npm test -- --ci --coverage


FROM deps AS builder
RUN npm install
COPY . .
CMD [ "npm", "run", "start" ]
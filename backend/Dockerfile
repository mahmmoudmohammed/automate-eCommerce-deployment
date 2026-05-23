FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS test
COPY . .
RUN node --test --experimental-test-coverage tests/

FROM deps AS production
COPY . .
CMD [ "npm", "run", "start" ]
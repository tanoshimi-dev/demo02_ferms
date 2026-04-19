FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS development
EXPOSE 3000
CMD ["sh", "-c", "npm run dev -- --public --port ${PORT:-3000} --publicURL ${NUXT_PUBLIC_FRONTEND_PUBLIC_URL:-http://localhost:3000}"]

FROM base AS build
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

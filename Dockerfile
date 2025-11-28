# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build-time env for Vite (override .env defaults)
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_JOBS_API_URL=
ARG VITE_SCRAPE_API_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_JOBS_API_URL=${VITE_JOBS_API_URL}
ENV VITE_SCRAPE_API_URL=${VITE_SCRAPE_API_URL}

# Build static assets
RUN npm run build

# --- Runtime stage ---
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENV PORT=8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]


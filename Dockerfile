# --- Base stage ---
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files trước để cache deps
COPY package*.json ./

# Cài dependencies (bao gồm dev để build)
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build client + server
RUN npm run build


# --- Production stage ---
FROM node:18-alpine AS prod

WORKDIR /app

# Copy package files
COPY --from=base /app/package*.json ./

# Copy output build + server runtime
COPY --from=base /app/dist ./dist
COPY --from=base /app/database ./database
COPY --from=base /app/knexfile.js ./knexfile.js

# Cài chỉ production deps
RUN npm ci --omit=dev

# Tạo user không chạy bằng root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["npm", "start"]

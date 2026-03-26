FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build


# ---- Стадия запуска ----
FROM nginx:1.27-alpine

# Убираем дефолтный конфиг nginx
RUN rm /etc/nginx/conf.d/default.conf

# Кладём собранные статические файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Конфиг для SPA (react-router, history fallback)
COPY nginx.spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/index.html || exit 1

CMD ["nginx", "-g", "daemon off;"]

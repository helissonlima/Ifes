FROM node:20-alpine

WORKDIR /app

# Instala dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código
COPY . .

# Roda como usuário sem privilégios (a imagem node:alpine já traz "node",
# UID/GID 1000) em vez de root, que é o padrão do Docker.
USER node

EXPOSE 3001

CMD ["node", "server.js"]

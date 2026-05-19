FROM node:20-alpine

WORKDIR /app

# Instala dependências de produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código
COPY . .

EXPOSE 3001

CMD ["node", "server.js"]

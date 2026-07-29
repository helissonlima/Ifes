# =============================================================
# SustentaCafé — Atalhos de operação via Docker Compose
#
#   make up        Gera o .env (1ª vez) e sobe tudo: build + up -d
#   make down      Para e remove os containers
#   make restart   Reinicia os serviços
#   make logs      Acompanha os logs (Ctrl+C para sair)
#   make ps        Lista o status dos serviços
#   make rebuild   Recompila as imagens sem cache e sobe
#   make clean     Para tudo e REMOVE o volume do banco (apaga dados!)
# =============================================================

COMPOSE := docker compose
APP_URL  := http://localhost:5173

.DEFAULT_GOAL := up
.PHONY: up down restart logs ps rebuild clean env

# Gera o .env com senhas aleatórias de 32 caracteres apenas na primeira vez.
env:
	@if [ -f .env ]; then \
		echo "ℹ️  .env já existe — mantendo segredos atuais."; \
	elif command -v openssl >/dev/null 2>&1; then \
		echo "🔐 Gerando .env com segredos aleatórios de 32 caracteres..."; \
		ADMIN_EMAIL="admin@example.com"; \
		ADMIN_PASSWORD="$$(openssl rand -hex 16)"; \
		{ \
			echo "# Gerado automaticamente. NÃO commitar este arquivo."; \
			echo ""; \
			echo "# --- Aplicação ---"; \
			echo "APP_PORT=5173"; \
			echo "NODE_ENV=production"; \
			echo "FRONTEND_URL=http://localhost:5173"; \
			echo ""; \
			echo "# --- Banco de Dados ---"; \
			echo "DB_NAME=sustentabilidade_rural"; \
			echo "DB_USER=postgres"; \
			echo "DB_PASSWORD=$$(openssl rand -hex 16)"; \
			echo ""; \
			echo "# --- Segredos JWT (32 bytes / 64 caracteres cada) ---"; \
			echo "JWT_SECRET=$$(openssl rand -hex 32)"; \
			echo "JWT_REFRESH_SECRET=$$(openssl rand -hex 32)"; \
			echo ""; \
			echo "# --- Usuário Admin inicial ---"; \
			echo "ADMIN_EMAIL=$$ADMIN_EMAIL"; \
			echo "ADMIN_PASSWORD=$$ADMIN_PASSWORD"; \
		} > .env; \
		chmod 600 .env; \
		echo "✅ .env criado com segredos aleatórios de 32 caracteres."; \
		echo ""; \
		echo "🔑 Login admin inicial (anote — não será exibido novamente):"; \
		echo "   E-mail: $$ADMIN_EMAIL"; \
		echo "   Senha:  $$ADMIN_PASSWORD"; \
		echo ""; \
	else \
		echo "openssl não encontrado — usando Node para gerar o .env..."; \
		node scripts/init-env.js; \
	fi

up: env
	$(COMPOSE) up -d --build
	@echo ""
	@echo "🚀 Aplicação disponível em $(APP_URL)"

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

rebuild: env
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d
	@echo ""
	@echo "🚀 Aplicação disponível em $(APP_URL)"

clean:
	$(COMPOSE) down -v

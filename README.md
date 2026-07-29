# SustentaCafé — Sistema de Avaliação de Sustentabilidade Rural

Plataforma web/mobile para avaliação do Índice de Sustentabilidade Rural (IGS),
baseada na análise comparativa **metodologia de referência** (MG) × **instituição regional** (ES).

---

## Tecnologias

| Camada | Tecnologias |
|--------|------------|
| Frontend | React 19 + Vite, Material UI, React Router, Axios, Recharts, React Icons |
| Backend | Node.js + Express |
| Banco de dados | PostgreSQL |

---

## Pré-requisitos

- Node.js ≥ 18
- PostgreSQL ≥ 14

## Comandos Rápidos (na raiz do projeto)

```bash
# Desenvolvimento frontend
npm run dev -- --host 0.0.0.0

# Build frontend
npm run build

# Validação padrão (termos proibidos + build)
npm run verify

# Validação estrita (termos proibidos + lint + build)
npm run verify:strict
```

Esses comandos podem ser executados da pasta raiz (`Ifes/`) e evitam erros de contexto como `ENOENT` por falta de `package.json` no diretório atual.

## Docker (deploy)

Subir tudo (banco + API + frontend) com um único comando:

```bash
make up
```

O `make up` faz duas coisas:

1. **Gera o `.env` automaticamente na primeira execução**, preenchendo
   `DB_PASSWORD` e `JWT_SECRET` com senhas aleatórias de **32 caracteres**.
   Se o `.env` já existir, os segredos são preservados.
2. Roda `docker compose up -d --build`.

A aplicação fica disponível em **http://localhost:5173** (frontend Nginx, que
também faz proxy de `/api` para o backend).

Outros atalhos: `make logs`, `make ps`, `make down`, `make restart`,
`make rebuild` (build sem cache) e `make clean` (remove o volume do banco).

### Sem `make` (ex.: Windows)

```bash
docker compose up -d --build      # exige um .env existente
```

Para gerar o `.env` antes (equivalente ao passo 1 do `make up`):

```bash
npm run env        # gera .env com segredos de 32 caracteres (se ainda não existir)
# ou direto:
npm run up         # gera .env + docker compose up -d --build
```

> **Acesso externo / proxy reverso:** ajuste `FRONTEND_URL` e `APP_PORT` no
> `.env` conforme o domínio público. O backend usa `FRONTEND_URL` para o CORS.

---

## Instalação

### 1. Banco de dados

```bash
# Criar banco
createdb sustentabilidade_rural

# Configurar variáveis de ambiente
cd backend
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Executar migração
npm install
npm run migrate
```

### 2. Backend

```bash
cd backend
npm install
npm run dev     # desenvolvimento (nodemon)
# ou
npm start       # produção
```

API disponível em: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Alternativa equivalente pela raiz:

```bash
npm run dev -- --host 0.0.0.0
```

Interface disponível em: `http://localhost:5173`

---

## Funcionalidades

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral com IGS médio, gráfico radar, distribuição de classificações |
| **Propriedades** | CRUD de propriedades rurais com busca e filtros |
| **Nova Avaliação** | Wizard multi-etapas com os 30 indicadores em 4 dimensões |
| **Resultado** | Relatório completo com gauge IGS, gráficos e detalhamento |
| **Histórico** | Listagem filtrável de todas as avaliações |
| **Metodologia** | Documentação da metodologia referência metodológica regional |

---

## Estrutura da Avaliação

### Índice Geral de Sustentabilidade (IGS)

```
IGS = (IE × 0,30) + (IA × 0,35) + (IS × 0,20) + (IGQ × 0,15)
```

| Dimensão | Peso | Indicadores |
|----------|------|-------------|
| Econômica (IE) | 30% | 7 indicadores |
| Ambiental (IA) | 35% | 9 indicadores |
| Social (IS) | 20% | 7 indicadores |
| Gestão e Qualidade (IGQ) | 15% | 7 indicadores |
| **Total** | **100%** | **30 indicadores** |

### Classificação

| Faixa | Classificação |
|-------|--------------|
| 0,00 – 0,20 | Muito Baixa Sustentabilidade |
| 0,21 – 0,40 | Baixa Sustentabilidade |
| 0,41 – 0,60 | Sustentabilidade Moderada |
| 0,61 – 0,80 | Boa Sustentabilidade |
| 0,81 – 1,00 | Alta Sustentabilidade |

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/propriedades` | Listar propriedades |
| POST | `/api/propriedades` | Cadastrar propriedade |
| PUT | `/api/propriedades/:id` | Atualizar propriedade |
| DELETE | `/api/propriedades/:id` | Excluir propriedade |
| GET | `/api/avaliacoes` | Listar avaliações |
| GET | `/api/avaliacoes/estatisticas` | Dashboard stats |
| POST | `/api/avaliacoes` | Criar avaliação |
| PUT | `/api/avaliacoes/:id/respostas` | Salvar respostas + calcular IGS |
| GET | `/api/indicadores` | Estrutura completa de indicadores |

---

## Estrutura do Projeto

```
Ifes/
├── backend/
│   ├── server.js
│   ├── migrations/
│   │   ├── 001_initial.sql
│   │   └── run.js
│   └── src/
│       ├── config/database.js
│       ├── models/indicadores.js
│       ├── controllers/
│       │   ├── propriedadesController.js
│       │   └── avaliacoesController.js
│       └── routes/
│           ├── propriedades.js
│           ├── avaliacoes.js
│           └── indicadores.js
└── frontend/
    └── src/
        ├── App.jsx
        ├── theme.js
        ├── services/api.js
        ├── context/AppContext.jsx
        ├── components/
        │   ├── Layout/
        │   ├── Dashboard/
        │   ├── Evaluation/
        │   └── Common/
        └── pages/
            ├── Dashboard.jsx
            ├── Propriedades.jsx
            ├── NovaAvaliacao.jsx
            ├── Resultado.jsx
            ├── Historico.jsx
            └── Metodologia.jsx
```

---

Desenvolvido com base na análise comparativa referência metodológica regional — Microrregião do Caparaó.

---

## Licença

Este projeto usa licença proprietária. Consulte o arquivo `LICENSE`.

---

## Publicação Segura no GitHub

Antes de publicar este repositório:

1. Garanta que arquivos `.env` não estão versionados.
2. Mantenha apenas `.env.example` com valores de exemplo.
3. Defina `ADMIN_EMAIL` e `ADMIN_PASSWORD` no ambiente de execução.
4. Troque (rotate) segredos já utilizados anteriormente (JWT e senha de banco).

# SustentaCafé — Sistema de Avaliação de Sustentabilidade Rural

Plataforma web/mobile para avaliação do Índice de Sustentabilidade Rural (IGS),
baseada na análise comparativa **ISA-EPAMIG** (MG) × **INCAPER** (ES).

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

## Docker Compose

Se preferir subir tudo com Docker, `docker compose up` agora cria automaticamente
um volume de segredos na primeira execução e gera chaves de 32 caracteres para
o banco e para o JWT. Depois disso, os segredos ficam persistidos no volume
`secrets` e são reutilizados nas próximas execuções.

Para acesso externo, a URL pública do frontend deve ficar em
`https://cafe.h3info.com:4300`. O `.env` e o backend usam esse valor para CORS.
Se a terminação TLS acontecer em outro proxy, mantenha o mesmo host/porta no
ambiente e ajuste apenas a infraestrutura de rede.

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
| **Metodologia** | Documentação da metodologia ISA-EPAMIG/INCAPER |

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

Desenvolvido com base na análise comparativa ISA-EPAMIG / INCAPER — Microrregião do Caparaó.

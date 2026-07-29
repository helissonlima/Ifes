# SustentaCafé — Frontend

Interface web (PWA) do Sistema de Avaliação de Sustentabilidade Rural — ICSR (Índice Consolidado de Sustentabilidade Rural).

React 19 + MUI + Vite. Consome a API em [`../backend`](../backend).

## Desenvolvimento

```bash
npm install
npm run dev
```

Requer a variável `VITE_API_URL` apontando para a API (ver [`../.env.example`](../.env.example)). Sem ela, usa `http://localhost:3001/api` em desenvolvimento.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`dist/`)
- `npm run preview` — serve o build de produção localmente
- `npm run lint` — ESLint

Para rodar o sistema completo (frontend + backend + banco), veja o `make up` na raiz do projeto.

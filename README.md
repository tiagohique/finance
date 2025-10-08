# Personal Finance App

Aplicacao full-stack para gerenciar financas pessoais com NestJS no backend e React + Vite no frontend. O foco e disponibilizar cadastros de entradas, despesas, salarios, categorias e relatorios com exportacao em CSV.

## Estrutura do projeto

```
app/
  backend/   # NestJS API e arquivos de dados JSON
  frontend/  # React + Vite + Tailwind UI
```

## Requisitos

- Node.js 18+
- npm 10+

## Backend (`app/backend`)

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Executar em desenvolvimento (porta 3000):
   ```bash
   npm run start:dev
   ```
3. Outros scripts:
   - `npm run build` gera saida em `dist/`
   - `npm run start:prod` inicia a versao compilada (execulte `npm run build` antes)
   - `npm run test` executa os testes com Jest
   - `npm run lint` roda ESLint

### Dados persistidos

- Os arquivos JSON ficam em `app/backend/data/*.json`. O repositorio trabalha com escrita atomica e bloqueio leve em memoria.
- Ajuste os valores de seeds conforme necessario antes de iniciar a aplicacao.

### Documentacao da API

- Swagger disponivel em `http://localhost:3000/api/docs` com a API rodando.
- Credenciais padrao: usuario `admin` e senha `admin123`. Defina variaveis de ambiente `SWAGGER_USER` e `SWAGGER_PASSWORD` para personalizar.

## Frontend (`app/frontend`)

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Executar ambiente de desenvolvimento (porta 5173):
   ```bash
   npm run dev
   ```
3. Scripts uteis:
   - `npm run build` gera bundle de producao
   - `npm run preview` serve o build gerado
   - `npm run lint` roda ESLint
   - `npm run test` executa testes com Vitest + Testing Library

### Configuracao

- O frontend espera o backend em `http://localhost:3000/api`. Para apontar para outra URL, crie um arquivo `.env` em `app/frontend` com:
  ```bash
  VITE_API_BASE_URL="http://seu-host:porta/api"
  ```

## Fluxo de uso

1. Inicie o backend (`npm run start:dev`).
2. Inicie o frontend (`npm run dev`).
3. Acesse `http://localhost:5173` no navegador, escolha o mes/ano na navbar e gerencie salarios, entradas, despesas e relatorios.
4. Use o botao "Exportar CSV" na pagina de relatorios para baixar o consolidado mensal.

## Docker

- Backend:
  ```bash
  cd app/backend
  docker build -t financas-backend .
  docker run --name financas-backend -p 3000:3000 financas-backend
  ```
- Frontend:
  ```bash
  cd app/frontend
  docker build -t financas-frontend --build-arg VITE_API_BASE_URL=http://localhost:3000/api .
  docker run --name financas-frontend -p 5173:80 financas-frontend
  ```
- Para alterar portas, ajuste o lado esquerdo de `-p externa:interna` (ex.: backend `-p 8080:3000`, frontend `-p 8081:80`).

## Testes

- Backend: `cd app/backend && npm run test`
- Frontend: `cd app/frontend && npm run test`

## Notas adicionais

- O estado global leve (mes/ano, toasts) usa Zustand com persistencia de periodo em `localStorage`.
- Os relatorios consideram despesas recorrentes para todos os meses posteriores a data base do lancamento sem duplicacoes fisicas.
- O CSV contem as colunas `type`, `date`, `description`, `category`, `paymentMethod`, `amount` com separador `,`.

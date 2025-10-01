# Case NVIDIA - Inception

## Tecnologias

* **Backend**: Python 3.10+, FastAPI, SQLAlchemy, PostgreSQL
* **Frontend**: React 18, Next.js 13 (App Router), TypeScript, Recharts
* **Estilização**: TailwindCSS, ShadCN/UI
* **Banco de Dados**: PostgreSQL

---

## Pré-requisitos

Certifique-se de ter instalados:

* Python 3.10 ou superior
* Node.js 18 ou superior
* PostgreSQL
* npm ou yarn


---

## Instalação

### Backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Crie um ambiente virtual e ative:

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Instale as dependências:

```bash
pip install -r requirements.txt
```

4. Crie o banco de dados PostgreSQL e configure o usuário.

---

### Frontend

1. Entre na pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
# ou
yarn
```

---

## Configuração

### Backend

Crie um arquivo `.env` na raiz do backend com as variáveis:

```env
DATABASE_URL=postgresql+psycopg2://usuario:senha@localhost:5432/nome_do_banco
SECRET_KEY=sua_chave_secreta
```

### Frontend

Crie um arquivo `.env.local` na raiz do frontend com a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Executando o projeto

### Backend

```bash
# Ativando o venv se ainda não ativou
python -m uvicorn app.main:app --reload
```

O backend estará disponível em: [http://localhost:8000](http://localhost:8000)

### Frontend

```bash
npm run dev
# ou
yarn dev
```

O frontend estará disponível em: [http://localhost:3000](http://localhost:3000)

---


## Endpoints disponíveis

* `GET /api/startups` → Lista startups
* `POST /api/startups/{id}` → Pesquisa e Salva startups


---


## Scripts úteis

### Backend

```bash
# Criar tabelas no banco
python -m app.db_init
```

### Frontend

```bash
npm run build      # Build produção
npm start          # Start produção
```


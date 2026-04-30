# LLM Summarizer API

API de resumo de textos com arquitetura em dois servicos:
- `node-api` (TypeScript + Express): recebe as requisicoes do cliente, valida dados e gerencia tarefas.
- `python-llm` (FastAPI + LangChain): gera o resumo no idioma solicitado usando modelo via Hugging Face.

## Sumario

1. [Visao geral](#visao-geral)
2. [Funcionalidades](#funcionalidades)
3. [Arquitetura](#arquitetura)
4. [Tecnologias](#tecnologias)
5. [Estrutura do projeto](#estrutura-do-projeto)
6. [Pre-requisitos](#pre-requisitos)
7. [Configuracao de ambiente](#configuracao-de-ambiente)
8. [Como executar](#como-executar)
9. [Documentacao da API Node](#documentacao-da-api-node)
10. [Documentacao da API Python](#documentacao-da-api-python)
11. [Fluxo completo (exemplo real)](#fluxo-completo-exemplo-real)
12. [Persistencia das tarefas](#persistencia-das-tarefas)
13. [Seguranca e boas praticas](#seguranca-e-boas-praticas)
14. [Solucao de problemas](#solucao-de-problemas)

## Visao geral

Este projeto implementa um fluxo de criacao de tarefas de resumo:

1. Cliente envia `text` e `lang` para `POST /tasks` no Node.
2. Node valida idioma (`pt`, `en`, `es`), cria tarefa e chama o Python em `/summarize`.
3. Python gera resumo com LangChain + modelo hospedado via Hugging Face.
4. Node salva o resumo na tarefa e retorna o objeto final.

## Funcionalidades

- Criacao de tarefa com resumo automatico (`POST /tasks`).
- Validacao de idiomas suportados: `pt`, `en`, `es`.
- Listagem de tarefas (`GET /tasks`).
- Busca por id (`GET /tasks/:id`).
- Remocao por id (`DELETE /tasks/:id`).
- Persistencia em arquivo JSON (`node-api/tasks.json`).
- Healthcheck em ambos os servicos:
  - Node: `GET /`
  - Python: `GET /`

## Arquitetura

```text
Cliente HTTP
   |
   v
Node API (localhost:3005)
   |- valida body (text, lang)
   |- cria/atualiza/remove tarefa
   |- persiste em tasks.json
   |
   v
Python LLM Service (localhost:8000)
   |- recebe text + lang
   |- monta prompt com idioma
   |- chama Hugging Face Router (OpenAI-compatible)
   v
Retorna { summary }
```

## Tecnologias

### Node
- Node.js + TypeScript
- Express
- dotenv
- ts-node-dev

### Python
- FastAPI
- Uvicorn
- LangChain
- langchain-openai

## Estrutura do projeto

```text
.
├─ node-api/
│  ├─ src/
│  │  ├─ app.ts
│  │  ├─ index.ts
│  │  ├─ routes/tasksRoutes.ts
│  │  └─ repositories/tasksRepository.ts
│  ├─ package.json
│  └─ tsconfig.json
├─ python-llm/
│  ├─ app/
│  │  ├─ main.py
│  │  └─ services/llm_service.py
│  └─ requirements.txt
└─ setup.sh
```

## Pre-requisitos

- Node.js 18+ (necessario para `fetch` nativo no Node).
- Python 3.10+.
- Token Hugging Face com permissao para Inference Providers.
- `pip` e `npm`.

## Configuracao de ambiente

Crie os arquivos abaixo localmente (nao commitar):

### `node-api/.env`

```env
PORT=3005
PYTHON_LLM_URL=http://127.0.0.1:8000
```

### `python-llm/.env`

```env
PORT=8000
HF_TOKEN=seu_token_hf_aqui
HF_MODEL=Qwen/Qwen2.5-72B-Instruct
```

`HF_MODEL` e opcional. Se nao informar, o default do codigo sera utilizado.

## Como executar

### Opcao 1: via script `setup.sh` (Git Bash / Linux / WSL)

Na raiz do projeto:

```bash
./setup.sh install-node
./setup.sh install-python
```

Terminal 1 (Node):
```bash
./setup.sh dev-node
```

Terminal 2 (Python):
```bash
./setup.sh dev-python
```

### Opcao 2: manual

Node:
```bash
cd node-api
npm install
npm run dev
```

Python:
```bash
cd python-llm
python -m venv .venv
# Linux/macOS
source .venv/bin/activate
# Windows (PowerShell)
# .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Documentacao da API Node

Base URL: `http://localhost:3005`

### 1) Healthcheck

`GET /`

Resposta `200`:

```json
{
  "message": "API is running"
}
```

### 2) Criar tarefa e gerar resumo

`POST /tasks`

Body:

```json
{
  "text": "Texto grande aqui...",
  "lang": "pt"
}
```

Idiomas aceitos:
- `pt`
- `en`
- `es`

Resposta `201`:

```json
{
  "message": "Tarefa criada com sucesso!",
  "task": {
    "id": 1,
    "text": "Texto grande aqui...",
    "summary": "Resumo gerado...",
    "lang": "pt"
  }
}
```

Erros comuns:
- `400` quando `lang` invalido:

```json
{
  "error": "Language not supported"
}
```

- `400` quando `text` ausente:

```json
{
  "error": "Campo \"text\" e obrigatorio."
}
```

- `500` quando falha integracao com Python/LLM:

```json
{
  "error": "Ocorreu um erro ao criar a tarefa."
}
```

### 3) Listar tarefas

`GET /tasks`

Resposta `200`:

```json
[
  {
    "id": 1,
    "text": "Texto...",
    "summary": "Resumo...",
    "lang": "pt"
  }
]
```

### 4) Buscar tarefa por id

`GET /tasks/:id`

Resposta `200`:

```json
{
  "id": 1,
  "text": "Texto...",
  "summary": "Resumo...",
  "lang": "pt"
}
```

Se nao existir:

```json
{
  "error": "Task not found"
}
```

### 5) Remover tarefa por id

`DELETE /tasks/:id`

Resposta `200`:

```json
{
  "message": "Task deleted successfully"
}
```

Se nao existir:

```json
{
  "error": "Task not found"
}
```

## Documentacao da API Python

Base URL: `http://localhost:8000`

### 1) Healthcheck

`GET /`

Resposta:

```json
{
  "message": "API is running"
}
```

### 2) Gerar resumo

`POST /summarize`

Body:

```json
{
  "text": "Texto para resumir...",
  "lang": "pt"
}
```

Resposta `200`:

```json
{
  "summary": "Resumo do texto..."
}
```

## Fluxo completo (exemplo real)

### Criar tarefa

```bash
curl --location 'http://localhost:3005/tasks' \
--header 'Content-Type: application/json' \
--data '{
  "text": "Diagnosticos medicos e decisoes juridicas: o papel da IA...",
  "lang": "pt"
}'
```

### Buscar por id

```bash
curl --location 'http://localhost:3005/tasks/1'
```

### Deletar tarefa

```bash
curl --location --request DELETE 'http://localhost:3005/tasks/1'
```

## Persistencia das tarefas

- As tarefas sao armazenadas em `node-api/tasks.json`.
- O arquivo e carregado na inicializacao do Node.
- O arquivo e atualizado a cada criacao, atualizacao e remocao.

## Seguranca e boas praticas

- Nunca commitar `.env` com tokens.
- O projeto usa `.gitignore` para ignorar arquivos de ambiente.
- Se um token ja foi exposto em qualquer commit, gere outro token e revogue o antigo.
- Em producao, use gerenciador de segredos (ex.: GitHub Actions Secrets, Vault, etc).

## Solucao de problemas

### Erro 500 ao criar tarefa no Node

Verifique:
1. Python esta de pe em `http://127.0.0.1:8000`.
2. `PYTHON_LLM_URL` aponta para a porta correta.
3. `HF_TOKEN` tem permissao para Inference Providers.

### Erro de conexao `ECONNREFUSED ::1:8000`

Use `127.0.0.1` em vez de `localhost` no `PYTHON_LLM_URL`.

### `Language not supported`

Envie apenas `pt`, `en` ou `es`.

---

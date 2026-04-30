# LLM Summarizer API

Este projeto e uma API Node.js desenvolvida com TypeScript e Express, que permite aos usuarios submeter textos e receber resumos gerados por um servico Python utilizando LangChain.
O resumo gerado e salvo com o texto original e a versao resumida e traduzida conforme o idioma solicitado pelo usuario.

## Estrutura do Projeto

- **node-api/**: Contem a implementacao da API Node.js.
- **python-llm/**: Contem a implementacao do servico Python.

## Environment

**HF_TOKEN**: Token de acesso ao Hugging Face (https://huggingface.co/settings/tokens).

## Como Executar

1. Clone o repositorio.
2. Navegue ate o diretorio do projeto.
3. Instale as dependencias:
   - `./setup.sh install-node`
   - `./setup.sh install-python`
4. Inicie as APIs:
   - `./setup.sh dev-node`
   - `./setup.sh dev-python`

## Endpoints

- `POST /tasks`: cria tarefa com `text` e `lang`.
- `GET /tasks`: lista tarefas.
- `GET /tasks/:id`: busca tarefa por id.
- `DELETE /tasks/:id`: remove tarefa por id.

## Observacao

Este repositorio utiliza `.gitignore` para impedir o versionamento de variaveis de ambiente (`.env`).

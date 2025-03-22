# MCP Continuity Server (Versão Corrigida)

Um servidor MCP para gerenciamento de continuidade e estado em projetos, baseado no MCP Continuity Tool. Esta versão foi corrigida para ser compatível com o SDK MCP versão 1.7.0.

## Correções

Esta versão corrige os seguintes problemas da versão original:

1. Incompatibilidade com SDK MCP 1.7.0 (original usava 1.0.1)
2. Suporte aos métodos `resources/list` e `prompts/list` com a sintaxe correta
3. Versão atualizada e testada com Claude Desktop

## Pré-requisitos

- Node.js 18+
- npm ou npx

## Instalação e Uso

### Instalação Global

```bash
npm install -g @lucasdoreac/mcp-continuity-server
```

### Uso com npx

```bash
npx @lucasdoreac/mcp-continuity-server
```

### Configuração no Claude Desktop

Adicione esta entrada ao arquivo `claude_desktop_config.json`:

```json
"continuity": {
  "command": "npx",
  "args": [
    "-y",
    "@lucasdoreac/mcp-continuity-server"
  ]
}
```

### Uso a partir do código fonte

1. Clone o repositório:
```bash
git clone https://github.com/Lucasdoreac/mcp-continuity-server-fixed.git
cd mcp-continuity-server-fixed
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor:
```bash
node src/index.js
```

### Como servidor web

Para iniciar como um servidor HTTP:

```bash
node src/index.js server
```

## Ferramentas Disponíveis

* `initProjectState` - Inicializa o estado de um projeto com base em um repositório
* `loadProjectState` - Carrega o estado atual de um projeto
* `updateProjectState` - Atualiza campos específicos no estado do projeto
* `analyzeRepository` - Analisa a estrutura de um repositório para obter insights
* `generateContinuityPrompt` - Gera um prompt otimizado para continuar o desenvolvimento

## Arquivos de Estado

O servidor cria e gerencia um arquivo `project-status.json` que armazena o estado atual de desenvolvimento. Este arquivo contém:

* Informações do projeto (nome, repositório, diretório de trabalho)
* Estado atual do desenvolvimento (arquivo atual, componente, tarefas)
* Lista de componentes (concluídos, em progresso, pendentes)
* Contexto de desenvolvimento (último pensamento, próximos passos)

## Licença

MIT
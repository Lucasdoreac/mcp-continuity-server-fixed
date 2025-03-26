# MCP Continuity Server (Versão Simplificada)

Um servidor MCP para gerenciamento de continuidade e estado em projetos, baseado no MCP Continuity Tool. Esta versão foi simplificada para ser compatível com o SDK MCP versão 1.7.0.

## Principais Funcionalidades

- Gerenciamento de estado do projeto entre sessões do Claude Desktop
- Compatibilidade com SDK MCP 1.7.0 
- Interface web para visualização e gerenciamento do estado
- Análise de repositórios para obter insights
- Geração de prompts de continuidade otimizados

## Correções e Melhorias na Versão 1.0.9

Esta versão faz as seguintes alterações:

1. Atualização do SDK MCP para 1.7.0 (original usava 1.0.1)
2. **Remoção completa** dos handlers `resources/list` e `prompts/list` que causavam erro
3. Interface web para visualização e gerenciamento do estado do projeto
4. Compatibilidade garantida com Claude Desktop
5. Substituição de emojis por texto para melhor compatibilidade
6. Formatação padronizada de mensagens de log
7. Implementação de testes automatizados para todos os componentes
8. Configuração de integração contínua com GitHub Actions

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

### Modo Servidor Web com Interface Gráfica

Para iniciar como um servidor HTTP com interface web:

```bash
node src/index.js server
```

Após iniciar, acesse a interface web em: http://localhost:3000

## Interface Web

A interface web permite:

- Visualizar o estado atual do projeto
- Monitorar componentes concluídos, em progresso e pendentes
- Ver as tarefas restantes para o componente atual
- Acompanhar o progresso do desenvolvimento
- Configurar parâmetros do servidor

![Interface Web](https://github.com/Lucasdoreac/mcp-continuity-server-fixed/assets/screenshots/dashboard.png)

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

## Histórico de Versões

### Versão 1.0.9
- Adição de interface web para visualização e gerenciamento do estado do projeto
- Implementação de testes automatizados para todos os componentes
- Configuração de integração contínua com GitHub Actions
- Substituição de todos os emojis por equivalentes textuais para garantir compatibilidade com Claude Desktop
- Padronização das mensagens de log com prefixos textuais [INFO], [OK], [AVISO], [ERRO]
- Melhorias na documentação e comentários JSDoc

### Versão 1.0.8
- Atualização das dependências de segurança
- Correções de bugs menores

### Versão 1.0.7
- Simplificação do servidor, removendo funcionalidades que não são essenciais 
- Compatibilidade com a versão 1.7.0 do SDK MCP
- Remoção de handlers que causavam conflitos

## Testes e Qualidade

Execute os testes automatizados com:

```bash
npm test
```

Para verificar a cobertura de código:

```bash
npm run test:coverage
```

## Licença

MIT
# Exemplos de Uso do MCP Continuity Server

Este documento fornece exemplos práticos de como utilizar o MCP Continuity Server em diferentes cenários.

## Uso com Claude Desktop

O cenário principal para o MCP Continuity Server é manter o contexto entre diferentes sessões do Claude Desktop.

### Configuração Inicial

1. Instale o servidor globalmente:
   ```bash
   npm install -g @lucasdoreac/mcp-continuity-server
   ```

2. Configure o Claude Desktop para usar o servidor adicionando esta entrada ao arquivo `claude_desktop_config.json`:
   ```json
   "continuity": {
     "command": "npx",
     "args": [
       "-y",
       "@lucasdoreac/mcp-continuity-server"
     ]
   }
   ```

3. Reinicie o Claude Desktop para aplicar as alterações.

### Uso Inicial

Na primeira vez que você usar o MCP Continuity Server com um projeto, inicialize o estado do projeto:

1. Inicie uma conversa com Claude Desktop
2. Informe sobre o projeto que deseja trabalhar, por exemplo:

```
Estou trabalhando em um projeto chamado "meu-projeto" hospedado em https://github.com/usuario/meu-projeto. 
Vamos usar o MCP Continuity Server para manter o contexto entre nossas sessões.
```

3. O Claude inicializará o estado do projeto e criará um arquivo `project-status.json`

### Continuando o Desenvolvimento

Para continuar o desenvolvimento em uma nova sessão:

1. Inicie uma nova conversa com Claude Desktop
2. Digite apenas "continue" como primeira mensagem
3. O Claude carregará o estado anterior e continuará o desenvolvimento do ponto onde parou

## Uso como Servidor Web

Você também pode usar o MCP Continuity Server como um servidor web para visualizar e gerenciar o estado do projeto através de uma interface gráfica.

### Início do Servidor

```bash
npx @lucasdoreac/mcp-continuity-server server
```

Ou se instalado localmente:

```bash
node src/index.js server
```

### Acesso à Interface Web

Abra um navegador e acesse:

```
http://localhost:3000
```

### Interação via API REST

Você pode interagir com o estado do projeto através da API REST. Exemplo usando curl:

#### Obtendo o Estado Atual

```bash
curl http://localhost:3000/api/state
```

#### Atualizando o Estado

```bash
curl -X PUT -H "Content-Type: application/json" -d '{"development":{"currentComponent":"Novo Componente"}}' http://localhost:3000/api/state
```

## Uso em Diferentes Cenários

### Cenário 1: Projeto Individual

Para um desenvolvedor trabalhando sozinho em um projeto:

1. Inicialize o estado do projeto normalmente
2. Use o servidor para manter o contexto entre sessões
3. Use a interface web para visualizar o progresso do projeto

### Cenário 2: Equipe Pequena

Para uma equipe pequena trabalhando no mesmo projeto:

1. Inicialize o estado do projeto em um servidor compartilhado
2. Configure o servidor para rodar continuamente:
   ```bash
   nohup node src/index.js server &
   ```
3. Compartilhe a URL da interface web com a equipe
4. Cada membro da equipe pode visualizar o estado atual do projeto

### Cenário 3: Integração com CI/CD

Para integração com pipelines de CI/CD:

1. Configure o servidor para rodar como parte do pipeline
2. Atualize o estado do projeto via API REST após cada build bem-sucedido:
   ```bash
   curl -X PUT -H "Content-Type: application/json" -d '{"components":{"completed":[{"name":"Build","priority":"high"}]}}' http://localhost:3000/api/state
   ```

## Dicas e Truques

### 1. Personalização do Estado

Você pode personalizar o estado do projeto para atender às suas necessidades específicas. O formato JSON permite adicionar campos personalizados.

### 2. Múltiplos Projetos

Para gerenciar múltiplos projetos, você pode:

1. Iniciar o servidor com um nome de arquivo específico:
   ```bash
   node src/index.js server --project-file=projeto1-status.json
   ```

2. Ou criar diretórios separados para cada projeto.

### 3. Backup do Estado

Recomendamos fazer backup regular do arquivo `project-status.json` para evitar perda de dados. Uma opção é versioná-lo junto com o código-fonte.

### 4. Integração com Outras Ferramentas

O MCP Continuity Server pode ser integrado com outras ferramentas através da API REST. Exemplos:

- Dashboards de progresso
- Ferramentas de gerenciamento de projeto
- Notificações de equipe (Slack, Discord, etc.)

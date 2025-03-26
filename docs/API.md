# Documentação da API do MCP Continuity Server

Esta documentação descreve os endpoints disponíveis na API REST do MCP Continuity Server quando executado em modo HTTP.

## Visão Geral

O MCP Continuity Server fornece uma API RESTful para interagir com o estado do projeto. Todos os endpoints usam JSON para troca de dados.

### URL Base

Por padrão, o servidor roda em:

```
http://localhost:3000
```

## Endpoints

### Obter Estado do Projeto

Retorna o estado atual completo do projeto.

```
GET /api/state
```

#### Parâmetros

Nenhum

#### Resposta de Sucesso (200 OK)

```json
{
  "projectInfo": {
    "name": "mcp-continuity-server-fixed",
    "repository": "https://github.com/Lucasdoreac/mcp-continuity-server-fixed",
    "workingDirectory": null,
    "lastUpdated": "2025-03-26T02:30:00.000Z",
    "version": "1.0.9"
  },
  "development": {
    "currentFile": null,
    "currentComponent": "Documentação e Melhorias",
    "inProgress": {
      "type": "enhancement",
      "description": "Melhorias e documentação final antes da versão 1.1.0",
      "remainingTasks": [
        "Criar documentação de API para endpoints web",
        "Adicionar exemplos de uso na documentação",
        "Implementar autenticação básica para interface web",
        "Preparar para publicação no npm como versão 1.1.0"
      ]
    }
  },
  "components": {
    "completed": [...],
    "inProgress": [...],
    "pending": []
  },
  "context": {
    "lastThought": "...",
    "nextSteps": [...],
    "dependencies": [...]
  }
}
```

#### Resposta de Erro (500 Internal Server Error)

```json
{
  "error": "Falha ao carregar estado do projeto",
  "message": "Detalhes do erro"
}
```

### Atualizar Estado do Projeto

Atualiza campos específicos no estado do projeto.

```
PUT /api/state
```

#### Parâmetros

JSON com os campos a serem atualizados. Você pode atualizar qualquer parte do estado, os campos não informados permanecerão inalterados.

Exemplo:

```json
{
  "development": {
    "currentComponent": "Novo Componente",
    "inProgress": {
      "description": "Nova descrição"
    }
  }
}
```

#### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Estado do projeto atualizado com sucesso",
  "result": {
    // Detalhes da atualização
  }
}
```

#### Resposta de Erro (400 Bad Request)

```json
{
  "error": "Nenhuma atualização fornecida"
}
```

#### Resposta de Erro (500 Internal Server Error)

```json
{
  "error": "Falha ao atualizar estado do projeto",
  "message": "Detalhes do erro"
}
```

### Gerar Prompt de Continuidade

Gera um prompt otimizado para continuar o desenvolvimento com base no estado atual.

```
GET /api/prompt
```

#### Parâmetros

Nenhum

#### Resposta de Sucesso (200 OK)

```json
{
  "prompt": "# Prompt de Continuidade\n\nContexto do projeto: ..."
}
```

#### Resposta de Erro (500 Internal Server Error)

```json
{
  "error": "Falha ao gerar prompt de continuidade",
  "message": "Detalhes do erro"
}
```

### Status do Servidor

Retorna o status atual do servidor.

```
GET /api/status
```

#### Parâmetros

Nenhum

#### Resposta de Sucesso (200 OK)

```json
{
  "status": "online",
  "timestamp": "2025-03-26T02:30:00.000Z",
  "version": "1.0.9"
}
```

## Exemplos de Uso

### Obter Estado do Projeto

```javascript
// Exemplo usando fetch
fetch('http://localhost:3000/api/state')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

### Atualizar Estado do Projeto

```javascript
// Exemplo usando fetch
fetch('http://localhost:3000/api/state', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    development: {
      currentComponent: "Novo Componente"
    }
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

## Códigos de Status

- `200 OK` - Requisição bem-sucedida
- `400 Bad Request` - Requisição inválida (ex: faltando parâmetros obrigatórios)
- `500 Internal Server Error` - Erro no servidor

## Notas

- Todos os timestamps usam o formato ISO 8601
- Todas as respostas usam o formato JSON
- As requisições que modificam dados (PUT) exigem que o corpo da requisição esteja no formato JSON

## Futuras Melhorias

- Adicionar autenticação para proteger os endpoints
- Suporte para versionamento de API
- Suporte para filtrar campos específicos nas respostas
- Endpoints adicionais para análise de repositórios

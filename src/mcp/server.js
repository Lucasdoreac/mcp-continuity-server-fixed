import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { StateManager } from '../services/stateManager.js';
import { AutoSetup } from '../services/autoSetup.js';
import { RepositoryTools } from '../services/repositoryTools.js';

// Definir schemas adicionais compatíveis com SDK 1.7.0
const ResourcesListRequestSchema = {
  type: 'object',
  method: 'resources/list',
  params: {}
};

const PromptsListRequestSchema = {
  type: 'object',
  method: 'prompts/list',
  params: {}
};

export class MCPServer {
  constructor() {
    // Inicializa o servidor MCP
    this.server = new Server(
      {
        name: 'MCP Continuity Server',
        version: '1.0.6',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Inicializa os serviços
    this.stateManager = new StateManager();
    this.autoSetup = new AutoSetup();
    this.repoTools = new RepositoryTools();

    // Configurar os manipuladores usando schemas oficiais
    this.registerHandlers();
  }

  registerHandlers() {
    // Registra o manipulador de lista de ferramentas
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'initProjectState',
            description: 'Inicializa o estado de um projeto com base em um repositório',
            inputSchema: {
              type: 'object',
              properties: {
                repositoryUrl: {
                  type: 'string',
                  description: 'URL ou identificador do repositório'
                },
                workingDirectory: {
                  type: 'string',
                  description: 'Diretório de trabalho opcional (ex: \\'src\\', \\'frontend/src\\')'
                }
              },
              required: ['repositoryUrl']
            }
          },
          {
            name: 'loadProjectState',
            description: 'Carrega o estado atual de um projeto',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Caminho para o arquivo project-status.json (opcional)'
                }
              }
            }
          },
          {
            name: 'updateProjectState',
            description: 'Atualiza campos específicos no estado do projeto',
            inputSchema: {
              type: 'object',
              properties: {
                updates: {
                  type: 'object',
                  description: 'Objeto com os campos a serem atualizados'
                },
                projectPath: {
                  type: 'string',
                  description: 'Caminho para o arquivo project-status.json (opcional)'
                }
              },
              required: ['updates']
            }
          },
          {
            name: 'analyzeRepository',
            description: 'Analisa a estrutura de um repositório para obter insights',
            inputSchema: {
              type: 'object',
              properties: {
                workingDirectory: {
                  type: 'string',
                  description: 'Diretório de trabalho opcional (ex: \\'src\\', \\'frontend/src\\')'
                }
              }
            }
          },
          {
            name: 'generateContinuityPrompt',
            description: 'Gera um prompt otimizado para continuar o desenvolvimento na próxima sessão',
            inputSchema: {
              type: 'object',
              properties: {
                projectPath: {
                  type: 'string',
                  description: 'Caminho para o arquivo project-status.json (opcional)'
                }
              }
            }
          }
        ]
      };
    });

    // Registra o manipulador de chamada de ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const toolName = request.params.name;
        const args = request.params.arguments || {};

        switch (toolName) {
          case 'initProjectState':
            return await this.handleInitProjectState(args);
          case 'loadProjectState':
            return await this.handleLoadProjectState(args);
          case 'updateProjectState':
            return await this.handleUpdateProjectState(args);
          case 'analyzeRepository':
            return await this.handleAnalyzeRepository(args);
          case 'generateContinuityPrompt':
            return await this.handleGenerateContinuityPrompt(args);
          default:
            return {
              content: [{ type: 'text', text: `Ferramenta não encontrada: ${toolName}` }],
              isError: true
            };
        }
      } catch (error) {
        console.error('Erro ao processar chamada:', error);
        return {
          content: [{ type: 'text', text: `Erro interno: ${error.message}` }],
          isError: true
        };
      }
    });
    
    // Adicionar handler para resources/list (usando schema compatível com SDK 1.7.0)
    this.server.setRequestHandler(ResourcesListRequestSchema, async () => {
      return {
        resources: [
          {
            id: "project-state-template",
            name: "Template de Estado de Projeto",
            description: "Template JSON para inicialização de estado de projeto",
            contentType: "application/json"
          }
        ]
      };
    });

    // Adicionar handler para prompts/list (usando schema compatível com SDK 1.7.0)
    this.server.setRequestHandler(PromptsListRequestSchema, async () => {
      return {
        prompts: [
          {
            id: "continuity-prompt",
            name: "Prompt de Continuidade",
            description: "Prompt para usar nas próximas sessões para manter continuidade",
            template: "Use MCP Continuity Server para gerenciar o projeto {repositoryUrl}. Status: {projectStatus}"
          }
        ]
      };
    });
  }

  async handleInitProjectState(args) {
    try {
      const { repositoryUrl, workingDirectory = '' } = args;
      const result = await this.autoSetup.setupProjectState(repositoryUrl, workingDirectory);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      console.error('Erro em initProjectState:', error);
      return {
        content: [{ type: 'text', text: `Erro ao inicializar estado do projeto: ${error.message}` }],
        isError: true
      };
    }
  }

  async handleLoadProjectState(args) {
    try {
      const { projectPath = 'project-status.json' } = args;
      const result = await this.stateManager.loadProjectState(projectPath);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      console.error('Erro em loadProjectState:', error);
      return {
        content: [{ type: 'text', text: `Erro ao carregar estado do projeto: ${error.message}` }],
        isError: true
      };
    }
  }

  async handleUpdateProjectState(args) {
    try {
      const { updates, projectPath = 'project-status.json' } = args;
      const result = await this.stateManager.updateProjectState(updates, projectPath);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      console.error('Erro em updateProjectState:', error);
      return {
        content: [{ type: 'text', text: `Erro ao atualizar estado do projeto: ${error.message}` }],
        isError: true
      };
    }
  }

  async handleAnalyzeRepository(args) {
    try {
      const { workingDirectory = '' } = args;
      const result = await this.repoTools.analyzeRepository(workingDirectory);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
      };
    } catch (error) {
      console.error('Erro em analyzeRepository:', error);
      return {
        content: [{ type: 'text', text: `Erro ao analisar repositório: ${error.message}` }],
        isError: true
      };
    }
  }

  async handleGenerateContinuityPrompt(args) {
    try {
      const { projectPath = 'project-status.json' } = args;
      const state = await this.stateManager.loadProjectState(projectPath);
      const prompt = this.stateManager.generateContinuityPrompt(state);
      return {
        content: [{ type: 'text', text: prompt }]
      };
    } catch (error) {
      console.error('Erro em generateContinuityPrompt:', error);
      return {
        content: [{ type: 'text', text: `Erro ao gerar prompt de continuidade: ${error.message}` }],
        isError: true
      };
    }
  }

  async start() {
    // Usando console.error para evitar interferir com o transporte MCP
    console.error('Iniciando servidor MCP...');
    
    // Cria e conecta o transporte padrão (stdio)
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error('Servidor MCP iniciado com sucesso!');
  }

  async stop() {
    console.error('Parando servidor MCP...');
    await this.server.disconnect();
    console.error('Servidor MCP parado com sucesso!');
  }
}
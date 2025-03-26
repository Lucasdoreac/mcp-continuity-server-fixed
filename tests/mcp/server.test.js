import { jest } from '@jest/globals';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MCPServer } from '../../src/mcp/server.js';
import { StateManager } from '../../src/services/stateManager.js';
import { AutoSetup } from '../../src/services/autoSetup.js';
import { RepositoryTools } from '../../src/services/repositoryTools.js';

// Mock das dependências
jest.mock('@modelcontextprotocol/sdk/server/index.js');
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');
jest.mock('../../src/services/stateManager.js');
jest.mock('../../src/services/autoSetup.js');
jest.mock('../../src/services/repositoryTools.js');

describe('MCPServer', () => {
  let mcpServer;
  let mockServerInstance;
  let mockTransport;
  
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura mocks
    mockServerInstance = {
      setRequestHandler: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn()
    };
    
    // Configura o construtor do Server
    Server.mockImplementation(() => mockServerInstance);
    
    // Mock para o transporte
    mockTransport = {};
    StdioServerTransport.mockImplementation(() => mockTransport);
    
    // Cria uma nova instância para teste
    mcpServer = new MCPServer();
  });
  
  test('deve registrar handlers quando instanciado', () => {
    // Verifica se os handlers foram registrados
    expect(mockServerInstance.setRequestHandler).toHaveBeenCalledTimes(2);
  });
  
  test('deve iniciar o servidor corretamente', async () => {
    // Executa o método start
    await mcpServer.start();
    
    // Verifica se connect foi chamado com o transporte correto
    expect(mockServerInstance.connect).toHaveBeenCalledWith(mockTransport);
  });
  
  test('deve parar o servidor corretamente', async () => {
    // Executa o método stop
    await mcpServer.stop();
    
    // Verifica se disconnect foi chamado
    expect(mockServerInstance.disconnect).toHaveBeenCalled();
  });
  
  test('deve tratar chamadas de ferramentas válidas', async () => {
    // Mock para a função de manipulação específica
    const mockResult = { content: [{ type: 'text', text: 'Resultados de teste' }] };
    mcpServer.handleInitProjectState = jest.fn().mockResolvedValue(mockResult);
    
    // Simula uma solicitação
    const request = {
      params: {
        name: 'initProjectState',
        arguments: { repositoryUrl: 'https://github.com/test/repo' }
      }
    };
    
    // Obtém o manipulador de chamada de ferramentas
    const handler = mockServerInstance.setRequestHandler.mock.calls.find(
      call => call[0].name === 'CallToolRequest'
    )[1];
    
    // Executa o manipulador com a solicitação simulada
    const result = await handler(request);
    
    // Verifica se a função de manipulação foi chamada com os argumentos corretos
    expect(mcpServer.handleInitProjectState).toHaveBeenCalledWith(request.params.arguments);
    
    // Verifica o resultado
    expect(result).toBe(mockResult);
  });
  
  test('deve lidar com erros durante chamadas de ferramentas', async () => {
    // Mock para a função de manipulação que lança um erro
    mcpServer.handleLoadProjectState = jest.fn().mockRejectedValue(new Error('Erro de teste'));
    
    // Simula uma solicitação
    const request = {
      params: {
        name: 'loadProjectState',
        arguments: { projectPath: 'project-status.json' }
      }
    };
    
    // Obtém o manipulador de chamada de ferramentas
    const handler = mockServerInstance.setRequestHandler.mock.calls.find(
      call => call[0].name === 'CallToolRequest'
    )[1];
    
    // Executa o manipulador com a solicitação simulada
    const result = await handler(request);
    
    // Verifica se a resposta contém a mensagem de erro
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Erro de teste');
  });
  
  test('deve retornar erro para ferramenta desconhecida', async () => {
    // Simula uma solicitação para uma ferramenta desconhecida
    const request = {
      params: {
        name: 'ferramentaDesconhecida',
        arguments: {}
      }
    };
    
    // Obtém o manipulador de chamada de ferramentas
    const handler = mockServerInstance.setRequestHandler.mock.calls.find(
      call => call[0].name === 'CallToolRequest'
    )[1];
    
    // Executa o manipulador com a solicitação simulada
    const result = await handler(request);
    
    // Verifica a resposta
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Ferramenta não encontrada');
  });
});

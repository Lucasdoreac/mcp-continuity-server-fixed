import { jest } from '@jest/globals';
import fs from 'fs-extra';
import { StateManager } from '../src/services/stateManager.js';

// Mock fs-extra para evitar operações reais de arquivo durante testes
jest.mock('fs-extra');

describe('StateManager', () => {
  let stateManager;
  let mockState;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Cria uma instância para teste
    stateManager = new StateManager();
    
    // Define um estado de teste
    mockState = {
      projectInfo: {
        name: "TestProject",
        repository: "https://github.com/test/repo",
        lastUpdated: "2025-03-26T00:00:00.000Z"
      },
      development: {
        currentFile: "src/index.js",
        currentComponent: "TestComponent",
        inProgress: {
          type: "feature",
          description: "Implementando testes",
          remainingTasks: ["Finalizar testes"]
        }
      },
      components: {
        completed: [],
        inProgress: [],
        pending: []
      },
      context: {
        lastThought: "Precisamos implementar testes",
        nextSteps: [],
        dependencies: []
      },
      mcpTools: {
        lastUsed: {
          repl: null,
          artifacts: [],
          searchResults: []
        },
        cacheFiles: [],
        tempStorage: []
      }
    };
  });

  describe('loadProjectState', () => {
    test('deve carregar o estado do projeto quando o arquivo existe', async () => {
      // Configurar o mock
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockState);
      
      // Executar o método
      const result = await stateManager.loadProjectState('project-status.json');
      
      // Verificar o resultado
      expect(result).toEqual(mockState);
      expect(fs.pathExists).toHaveBeenCalledWith('project-status.json');
      expect(fs.readJson).toHaveBeenCalledWith('project-status.json');
    });
    
    test('deve retornar um template padrão quando o arquivo não existe', async () => {
      // Configurar o mock
      fs.pathExists.mockResolvedValue(false);
      
      // Executar o método
      const result = await stateManager.loadProjectState('project-status.json');
      
      // Verificar o resultado
      expect(result).toHaveProperty('projectInfo');
      expect(result).toHaveProperty('development');
      expect(result).toHaveProperty('components');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('mcpTools');
      expect(fs.pathExists).toHaveBeenCalledWith('project-status.json');
      expect(fs.readJson).not.toHaveBeenCalled();
    });
  });
  
  describe('saveProjectState', () => {
    test('deve salvar o estado do projeto corretamente', async () => {
      // Configurar o mock
      fs.outputJson.mockResolvedValue();
      
      // Executar o método
      const result = await stateManager.saveProjectState(mockState, 'project-status.json');
      
      // Verificar o resultado
      expect(result).toHaveProperty('success', true);
      expect(fs.outputJson).toHaveBeenCalledWith('project-status.json', expect.any(Object), { spaces: 2 });
    });
    
    test('deve retornar erro quando falhar ao salvar', async () => {
      // Configurar o mock para simular erro
      fs.outputJson.mockRejectedValue(new Error('Erro de teste'));
      
      // Executar o método
      const result = await stateManager.saveProjectState(mockState, 'project-status.json');
      
      // Verificar o resultado
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('error', 'Erro de teste');
    });
  });
  
  describe('updateProjectState', () => {
    test('deve atualizar campos específicos no estado do projeto', async () => {
      // Configurar os mocks
      fs.pathExists.mockResolvedValue(true);
      fs.readJson.mockResolvedValue(mockState);
      fs.outputJson.mockResolvedValue();
      
      // Definir atualizações
      const updates = {
        development: {
          currentComponent: "ComponenteAtualizado"
        }
      };
      
      // Executar o método
      const result = await stateManager.updateProjectState(updates, 'project-status.json');
      
      // Verificar o resultado
      expect(result.development.currentComponent).toBe("ComponenteAtualizado");
      expect(fs.pathExists).toHaveBeenCalledWith('project-status.json');
      expect(fs.readJson).toHaveBeenCalledWith('project-status.json');
      expect(fs.outputJson).toHaveBeenCalled();
    });
  });
  
  describe('generateContinuityPrompt', () => {
    test('deve gerar um prompt de continuidade com formato correto', () => {
      // Executar o método
      const result = stateManager.generateContinuityPrompt(mockState);
      
      // Verificar o resultado
      expect(result).toContain(mockState.projectInfo.repository);
      expect(result).toContain(mockState.context.lastThought);
      expect(result).toContain('Continue o desenvolvimento');
    });
    
    test('deve lidar com estado inválido', () => {
      // Executar o método com estado inválido
      const result = stateManager.generateContinuityPrompt(null);
      
      // Verificar o resultado
      expect(result).toContain('Estado do projeto não disponível');
    });
  });
});

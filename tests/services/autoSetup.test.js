import { jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { AutoSetup } from '../../src/services/autoSetup.js';
import { StateManager } from '../../src/services/stateManager.js';
import { RepositoryTools } from '../../src/services/repositoryTools.js';

// Mock fs-extra e as classes dependentes
jest.mock('fs-extra');
jest.mock('path');
jest.mock('../../src/services/stateManager.js');
jest.mock('../../src/services/repositoryTools.js');

describe('AutoSetup', () => {
  let autoSetup;
  let mockStateManager;
  let mockRepoTools;
  
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura mocks para as classes dependentes
    mockStateManager = {
      loadProjectState: jest.fn(),
      saveProjectState: jest.fn(),
      generateContinuityPrompt: jest.fn()
    };
    
    mockRepoTools = {
      analyzeRepository: jest.fn()
    };
    
    // Configura os construtores mocados
    StateManager.mockImplementation(() => mockStateManager);
    RepositoryTools.mockImplementation(() => mockRepoTools);
    
    // Mock para path.join
    path.join.mockImplementation((...args) => args.join('/'));
    
    // Cria instância para teste
    autoSetup = new AutoSetup();
  });
  
  describe('setupProjectState', () => {
    test('deve configurar projeto quando o estado já existe', async () => {
      // Mock para projeto existente
      const mockState = {
        projectInfo: {
          name: 'test-project',
          repository: 'https://github.com/test/repo'
        }
      };
      
      // Configuração dos mocks
      fs.ensureDir.mockResolvedValue();
      mockStateManager.loadProjectState.mockResolvedValue(mockState);
      
      // Executa o método
      const result = await autoSetup.setupProjectState('https://github.com/test/repo');
      
      // Verifica resultado
      expect(result).toBe(mockState);
      expect(mockStateManager.loadProjectState).toHaveBeenCalledWith('project-status.json');
    });
    
    test('deve criar novo state quando o arquivo não existe', async () => {
      // Mock para projeto não existente
      mockStateManager.loadProjectState.mockRejectedValue(new Error('Arquivo não encontrado'));
      mockStateManager.saveProjectState.mockResolvedValue({ success: true });
      
      // Mock para listagem de diretório
      fs.readdir.mockResolvedValue(['index.js', 'README.md']);
      
      // Executa o método
      await autoSetup.setupProjectState('https://github.com/test/repo');
      
      // Verifica se tentou carregar e depois salvar um novo template
      expect(mockStateManager.loadProjectState).toHaveBeenCalled();
      expect(mockStateManager.saveProjectState).toHaveBeenCalled();
      expect(mockStateManager.saveProjectState.mock.calls[0][0]).toHaveProperty('projectInfo.repository', 'https://github.com/test/repo');
    });
    
    test('deve lidar com diretório de trabalho especificado', async () => {
      // Mock para projeto não existente
      mockStateManager.loadProjectState.mockRejectedValue(new Error('Arquivo não encontrado'));
      mockStateManager.saveProjectState.mockResolvedValue({ success: true });
      
      // Mock para verificação e criação de diretório
      fs.ensureDir.mockResolvedValue();
      fs.readdir.mockResolvedValue(['index.js', 'README.md']);
      
      // Executa o método com diretório de trabalho
      await autoSetup.setupProjectState('https://github.com/test/repo', 'src');
      
      // Verifica se tentou garantir o diretório
      expect(fs.ensureDir).toHaveBeenCalledWith('src');
      expect(mockStateManager.saveProjectState.mock.calls[0][0].projectInfo.workingDirectory).toBe('src');
    });
  });
  
  describe('initializeEnvironment', () => {
    test('deve inicializar ambiente completo', async () => {
      // Mock para setupProjectState
      const mockState = {
        projectInfo: {
          name: 'test-project',
          repository: 'https://github.com/test/repo'
        },
        development: {
          currentFile: 'index.js'
        }
      };
      
      // Mock para análise do repositório
      const mockAnalysis = {
        fileCount: 10,
        categories: {
          code: ['index.js'],
          config: [],
          docs: [],
          web: [],
          dirs: []
        }
      };
      
      // Configuração dos mocks
      const setupProjectStateSpy = jest.spyOn(autoSetup, 'setupProjectState')
        .mockResolvedValue(mockState);
      mockRepoTools.analyzeRepository.mockResolvedValue(mockAnalysis);
      mockStateManager.generateContinuityPrompt.mockReturnValue('Mock prompt');
      
      // Executa o método
      const result = await autoSetup.initializeEnvironment('https://github.com/test/repo');
      
      // Verifica resultado
      expect(setupProjectStateSpy).toHaveBeenCalledWith('https://github.com/test/repo', '');
      expect(mockRepoTools.analyzeRepository).toHaveBeenCalledWith('');
      expect(mockStateManager.generateContinuityPrompt).toHaveBeenCalledWith(mockState);
      expect(result).toEqual({
        projectState: mockState,
        repoAnalysis: mockAnalysis,
        continuityPrompt: 'Mock prompt'
      });
    });
    
    test('deve lidar com erros durante a inicialização', async () => {
      // Mock para simular erro
      const setupProjectStateSpy = jest.spyOn(autoSetup, 'setupProjectState')
        .mockRejectedValue(new Error('Erro de teste'));
      
      // Verifica se o erro é propagado
      await expect(autoSetup.initializeEnvironment('https://github.com/test/repo'))
        .rejects.toThrow('Erro de teste');
    });
  });
});

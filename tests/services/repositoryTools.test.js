import { jest } from '@jest/globals';
import fs from 'fs-extra';
import path from 'path';
import { RepositoryTools } from '../../src/services/repositoryTools.js';

// Mock fs-extra e path
jest.mock('fs-extra');
jest.mock('path');

describe('RepositoryTools', () => {
  let repoTools;
  
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Mock para path.join
    path.join.mockImplementation((...args) => args.join('/'));
    
    // Cria instância para teste
    repoTools = new RepositoryTools();
  });
  
  describe('analyzeRepository', () => {
    test('deve analisar corretamente o repositório quando o diretório existe', async () => {
      // Configura mocks para existência do diretório e estatísticas de arquivo
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue([
        'index.js',
        'package.json',
        'README.md',
        'styles.css',
        'src'
      ]);
      
      // Mock para fs.stat para identificar diretórios
      fs.stat.mockImplementation((filePath) => {
        return Promise.resolve({
          isDirectory: () => filePath.endsWith('src')
        });
      });
      
      // Executa o método
      const result = await repoTools.analyzeRepository();
      
      // Verifica o resultado
      expect(fs.pathExists).toHaveBeenCalledWith('.');
      expect(fs.readdir).toHaveBeenCalledWith('.');
      expect(result).toEqual({
        fileCount: 5,
        categories: {
          code: ['index.js'],
          config: ['package.json'],
          docs: ['README.md'],
          web: ['styles.css'],
          dirs: ['src']
        },
        workingDirectory: ''
      });
    });
    
    test('deve analisar repositório com diretório de trabalho especificado', async () => {
      // Configura mocks para existência do diretório e estatísticas de arquivo
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue([
        'server.js',
        'utils.js',
        'config.json',
        'lib'
      ]);
      
      // Mock para fs.stat para identificar diretórios
      fs.stat.mockImplementation((filePath) => {
        return Promise.resolve({
          isDirectory: () => filePath.endsWith('lib')
        });
      });
      
      // Executa o método com diretório de trabalho
      const result = await repoTools.analyzeRepository('src');
      
      // Verifica o resultado
      expect(fs.pathExists).toHaveBeenCalledWith('src');
      expect(fs.readdir).toHaveBeenCalledWith('src');
      expect(result).toEqual({
        fileCount: 4,
        categories: {
          code: ['server.js', 'utils.js'],
          config: ['config.json'],
          docs: [],
          web: [],
          dirs: ['lib']
        },
        workingDirectory: 'src'
      });
    });
    
    test('deve retornar erro quando o diretório não existe', async () => {
      // Configura mocks para simular diretório não encontrado
      fs.pathExists.mockResolvedValue(false);
      
      // Executa o método
      const result = await repoTools.analyzeRepository('nonexistent');
      
      // Verifica o resultado
      expect(fs.pathExists).toHaveBeenCalledWith('nonexistent');
      expect(result).toEqual({
        fileCount: 0,
        categories: {
          code: [],
          config: [],
          docs: [],
          web: [],
          dirs: []
        },
        workingDirectory: 'nonexistent',
        error: 'Diretório não encontrado: nonexistent'
      });
    });
    
    test('deve lidar com erros durante a análise', async () => {
      // Configura mocks para simular erro durante a leitura
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockRejectedValue(new Error('Erro de leitura'));
      
      // Executa o método
      const result = await repoTools.analyzeRepository();
      
      // Verifica o resultado
      expect(fs.pathExists).toHaveBeenCalledWith('.');
      expect(fs.readdir).toHaveBeenCalledWith('.');
      expect(result).toEqual({
        fileCount: 0,
        categories: {
          code: [],
          config: [],
          docs: [],
          web: [],
          dirs: []
        },
        workingDirectory: '',
        error: 'Erro de leitura'
      });
    });
    
    test('deve lidar com erros ao verificar se um item é um diretório', async () => {
      // Configura mocks para simular erro ao verificar diretório
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue(['file.js', 'problem-dir']);
      
      // Mock para fs.stat que lança erro para um caso específico
      fs.stat.mockImplementation((filePath) => {
        if (filePath.includes('problem-dir')) {
          return Promise.reject(new Error('Erro ao verificar diretório'));
        }
        return Promise.resolve({
          isDirectory: () => false
        });
      });
      
      // Executa o método
      const result = await repoTools.analyzeRepository();
      
      // Verifica o resultado
      expect(fs.readdir).toHaveBeenCalledWith('.');
      expect(result.fileCount).toBe(2);
      expect(result.categories.dirs).toEqual([]);
      expect(result.categories.code).toContain('file.js');
    });
  });
});

import fs from 'fs-extra';
import path from 'path';

export class RepositoryTools {
  /**
   * Analisa a estrutura do repositório
   * @param {string} workingDirectory - Diretório de trabalho opcional
   * @returns {Promise<Object>} - Informações sobre a estrutura do repositório
   */
  async analyzeRepository(workingDirectory = '') {
    try {
      // Define o diretório para análise
      const dirToAnalyze = workingDirectory || '.';
      
      // Verifica se o diretório existe
      const dirExists = await fs.pathExists(dirToAnalyze);
      if (!dirExists) {
        throw new Error(`Diretório não encontrado: ${dirToAnalyze}`);
      }
      
      // Lista arquivos e diretórios
      const files = await fs.readdir(dirToAnalyze);
      console.log(`📁 Estrutura do repositório${workingDirectory ? ` (${workingDirectory})` : ''}:`);
      
      // Identifica diretórios
      const dirs = [];
      for (const file of files) {
        try {
          const filePath = path.join(workingDirectory || '.', file);
          const stat = await fs.stat(filePath);
          if (stat.isDirectory()) {
            dirs.push(file);
          }
        } catch (e) {
          // Ignora erros ao verificar diretórios
        }
      }
      
      // Categoriza arquivos para uma visão geral
      const categories = {
        code: files.filter(f => /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rb|php)$/i.test(f)),
        config: files.filter(f => /(config|settings|\.json|\.yml|\.xml)$/i.test(f)),
        docs: files.filter(f => /\.(md|txt|pdf|doc)$/i.test(f)),
        web: files.filter(f => /\.(html|css|scss)$/i.test(f)),
        dirs: dirs
      };
      
      // Mostra categorias relevantes
      console.log(`- ${categories.dirs.length} diretórios`);
      console.log(`- ${categories.code.length} arquivos de código`);
      console.log(`- ${categories.config.length} arquivos de configuração`);
      console.log(`- ${categories.docs.length} arquivos de documentação`);
      
      return {
        fileCount: files.length,
        categories: categories,
        workingDirectory: workingDirectory
      };
    } catch (e) {
      console.error('Não foi possível analisar o repositório:', e);
      return { 
        fileCount: 0, 
        categories: {
          code: [],
          config: [],
          docs: [],
          web: [],
          dirs: []
        }, 
        workingDirectory: workingDirectory,
        error: e.message
      };
    }
  }
}
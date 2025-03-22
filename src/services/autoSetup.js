import fs from 'fs-extra';
import path from 'path';
import { StateManager } from './stateManager.js';
import { RepositoryTools } from './repositoryTools.js';

export class AutoSetup {
  constructor() {
    this.stateManager = new StateManager();
    this.repoTools = new RepositoryTools();
  }

  /**
   * Configura e inicializa o project-status.json automaticamente
   * @param {string} repositoryUrl - URL ou identificador do repositório
   * @param {string} workingDirectory - Diretório de trabalho opcional (ex: 'src', 'frontend/src')
   * @returns {Promise<Object>} - Estado do projeto configurado
   */
  async setupProjectState(repositoryUrl, workingDirectory = '') {
    console.log(`🚀 Configurando ambiente para o repositório: ${repositoryUrl}${workingDirectory ? ` (diretório: ${workingDirectory})` : ''}`);
    
    // Extrai informações do repositório a partir da URL
    const repoPath = repositoryUrl.split('/').slice(-2).join('/').replace('.git', '');
    const repoName = repoPath.split('/')[1] || repositoryUrl.split('/').pop() || 'project';
    
    // Determina o caminho para o project-status.json
    const projectStatusPath = workingDirectory 
      ? path.join(workingDirectory, 'project-status.json')
      : 'project-status.json';
    
    // Verifica se o diretório de trabalho existe, caso especificado
    if (workingDirectory) {
      try {
        await fs.ensureDir(workingDirectory);
        console.log(`✅ Diretório ${workingDirectory} está disponível`);
      } catch (error) {
        console.log(`⚠️ Diretório ${workingDirectory} não encontrado. Tentando criar...`);
        try {
          // Tenta criar o diretório de trabalho
          await fs.ensureDir(workingDirectory);
          console.log(`✅ Diretório ${workingDirectory} criado`);
        } catch (dirError) {
          console.error(`❌ Erro ao criar diretório de trabalho: ${dirError}`);
          console.log('⚠️ Usando diretório raiz como alternativa.');
          workingDirectory = '';
        }
      }
    }
    
    // Verifica se o state já existe
    let projectState;
    try {
      // Tenta carregar o estado existente
      projectState = await this.stateManager.loadProjectState(projectStatusPath);
      console.log('✅ project-status.json encontrado para ' + repoName);
    } catch (error) {
      console.log('⚠️ project-status.json não encontrado. Criando um novo com dados do repositório...');
      
      // Coleta informações do repositório para preencher dinamicamente o template
      let mainFiles = [];
      try {
        // Define o diretório para listar arquivos
        const listDir = workingDirectory || '.';
        
        // Lista os arquivos disponíveis para identificar arquivos principais
        const files = await fs.readdir(listDir);
        mainFiles = files.filter(f => 
          f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.html') || 
          f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
        );
      } catch (e) {
        console.log('Não foi possível listar arquivos:', e);
      }
      
      // Define arquivo inicial baseado em convenções comuns
      const defaultMainFile = mainFiles.find(f => 
        ['index.js', 'main.js', 'app.js', 'index.jsx', 'index.ts', 'app.py'].includes(f)
      ) || (mainFiles.length > 0 ? mainFiles[0] : 'main.js');
      
      // Prepara o caminho do arquivo principal
      const mainFilePath = workingDirectory 
        ? path.join(workingDirectory, defaultMainFile)
        : defaultMainFile;
      
      // Cria um template preenchido com informações do repositório
      const template = {
        projectInfo: {
          name: repoName,
          repository: repositoryUrl,
          workingDirectory: workingDirectory || null,
          lastUpdated: new Date().toISOString()
        },
        development: {
          currentFile: mainFilePath,
          currentComponent: repoName + "Component",
          inProgress: {
            type: "feature",
            description: "Configuração inicial do projeto " + repoName,
            remainingTasks: ["Análise de requisitos", "Planejamento da arquitetura", "Implementação de funcionalidades core"]
          }
        },
        components: {
          completed: [],
          inProgress: [{name: "Sistema de Configuração", priority: "high"}],
          pending: [{name: "Interface de Usuário", priority: "medium"}, {name: "Testes", priority: "high"}]
        },
        context: {
          lastThought: "Iniciar o desenvolvimento com foco na arquitetura principal do " + repoName,
          nextSteps: ["Estruturar diretórios", "Definir interfaces principais", "Configurar ferramentas de build"],
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
      
      // Salva o template com informações reais
      await this.stateManager.saveProjectState(template, projectStatusPath);
      
      projectState = template;
      console.log('✅ Novo project-status.json criado com dados do repositório ' + repoName);
    }
    
    return projectState;
  }

  /**
   * Inicializa o ambiente completo para o repositório
   * @param {string} repositoryUrl - URL ou identificador do repositório
   * @param {string} workingDirectory - Diretório de trabalho opcional
   * @returns {Promise<Object>} - Informações do ambiente inicializado
   */
  async initializeEnvironment(repositoryUrl, workingDirectory = '') {
    try {
      console.log('🔄 Inicializando ambiente MCP...');
      
      // Configura o estado do projeto
      const projectState = await this.setupProjectState(repositoryUrl, workingDirectory);
      
      // Analisa o repositório
      const repoAnalysis = await this.repoTools.analyzeRepository(workingDirectory);
      
      // Gera prompt de continuidade
      const continuityPrompt = this.stateManager.generateContinuityPrompt(projectState);
      
      // Exibe informações de resumo
      console.log('\n📊 Resumo do Ambiente:');
      console.log(`- Projeto: ${projectState.projectInfo.name}`);
      console.log(`- Repositório: ${projectState.projectInfo.repository}`);
      if (workingDirectory) {
        console.log(`- Diretório de trabalho: ${workingDirectory}`);
      }
      console.log(`- Arquivo atual: ${projectState.development.currentFile}`);
      console.log(`- Tarefa em progresso: ${projectState.development.inProgress.description}`);
      console.log(`- Total de arquivos: ${repoAnalysis.fileCount}`);
      
      console.log('\n🔄 Prompt de continuidade para próximas sessões:');
      console.log(continuityPrompt);
      
      return {
        projectState,
        repoAnalysis,
        continuityPrompt
      };
    } catch (error) {
      console.error('❌ Erro ao inicializar ambiente:', error);
      throw error;
    }
  }
}
import fs from 'fs-extra';

export class StateManager {
  /**
   * Carrega o estado atual do projeto
   * @param {string} projectPath - Caminho para o arquivo project-status.json
   * @returns {Promise<Object>} - Objeto com o estado do projeto
   */
  async loadProjectState(projectPath = 'project-status.json') {
    try {
      // Verifica se o arquivo existe
      const fileExists = await fs.pathExists(projectPath);
      if (!fileExists) {
        throw new Error(`Arquivo não encontrado: ${projectPath}`);
      }
      
      // Lê o arquivo JSON
      const state = await fs.readJson(projectPath);
      return state;
    } catch (error) {
      console.error('Erro ao carregar o estado do projeto:', error);
      // Retorna um modelo padrão se falhar ao carregar o arquivo
      return {
        projectInfo: {
          name: "Project",
          repository: "",
          lastUpdated: new Date().toISOString()
        },
        development: {
          currentFile: "",
          currentComponent: "",
          inProgress: {
            type: "feature",
            description: "",
            remainingTasks: []
          }
        },
        components: {
          completed: [],
          inProgress: [],
          pending: []
        },
        context: {
          lastThought: "",
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
    }
  }

  /**
   * Salva o estado atual do projeto
   * @param {Object} state - Objeto de estado a ser salvo
   * @param {string} projectPath - Caminho para o arquivo project-status.json
   * @returns {Promise<Object>} - Resultado da operação
   */
  async saveProjectState(state, projectPath = 'project-status.json') {
    try {
      // Atualiza a data da última modificação
      state.projectInfo.lastUpdated = new Date().toISOString();
      
      // Converte o objeto em JSON formatado para legibilidade
      await fs.outputJson(projectPath, state, { spaces: 2 });
      
      return { success: true, message: 'Estado do projeto salvo com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar o estado do projeto:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Atualiza campos específicos no estado do projeto
   * @param {Object} updates - Objeto com os campos a serem atualizados
   * @param {string} projectPath - Caminho para o arquivo project-status.json
   * @returns {Promise<Object>} - Objeto atualizado de estado
   */
  async updateProjectState(updates, projectPath = 'project-status.json') {
    try {
      // Carrega o estado atual
      const currentState = await this.loadProjectState(projectPath);
      
      // Função auxiliar para mesclar objetos de forma profunda
      const deepMerge = (target, source) => {
        for (const key in source) {
          if (source[key] instanceof Object && key in target) {
            deepMerge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
        return target;
      };
      
      // Mescla as atualizações com o estado atual
      const updatedState = deepMerge(currentState, updates);
      
      // Salva o estado atualizado
      await this.saveProjectState(updatedState, projectPath);
      
      return updatedState;
    } catch (error) {
      console.error('Erro ao atualizar o estado do projeto:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Gera um prompt de continuidade baseado no estado atual
   * @param {Object} state - Estado atual do projeto
   * @returns {string} - Prompt formatado para continuidade
   */
  generateContinuityPrompt(state) {
    if (!state || !state.projectInfo) {
      return 'Estado do projeto não disponível. Carregue o estado primeiro.';
    }
    
    // Extrai informações relevantes do estado
    const { projectInfo, development, context } = state;
    
    // Cria o prompt no formato otimizado
    const repositoryUrl = projectInfo.repository || '[REPOSITÓRIO]';
    const currentContext = context.lastThought || development.inProgress.description || '[CONTEXTO_ATUAL]';
    
    // Simplifica o estado para o prompt (apenas o necessário)
    const simplifiedState = {
      projectInfo: {
        name: projectInfo.name,
        currentTask: development.inProgress.description,
        lastState: context.lastThought
      },
      development: {
        currentFile: development.currentFile,
        inProgress: development.inProgress.type + ': ' + development.inProgress.description
      }
    };
    
    // Formata o prompt
    return `Use MCP Continuity Server para manter estado de desenvolvimento:

Trabalhando em: ${repositoryUrl}
Contexto: ${currentContext}
Status do project-status.json:
${JSON.stringify(simplifiedState, null, 2)}

Continue o desenvolvimento a partir deste estado usando o servidor MCP de continuidade.`;
  }
}
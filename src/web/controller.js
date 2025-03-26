import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { StateManager } from '../services/stateManager.js';

// Obter o diretório atual (equivalente ao __dirname no CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classe que gerencia os endpoints da interface web
 * @class WebController
 */
export class WebController {
  /**
   * Cria uma instância do controlador web
   * @param {Object} options - Opções de configuração
   * @param {StateManager} options.stateManager - Instância do gerenciador de estado
   * @param {String} options.projectPath - Caminho para o arquivo de estado do projeto
   */
  constructor({ stateManager, projectPath = 'project-status.json' }) {
    this.router = express.Router();
    this.stateManager = stateManager || new StateManager();
    this.projectPath = projectPath;
    this.setupRoutes();
  }

  /**
   * Configura as rotas do controlador web
   * @private
   */
  setupRoutes() {
    // Rota para a página principal
    this.router.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'index.html'));
    });

    // API para obter o estado atual do projeto
    this.router.get('/api/state', async (req, res) => {
      try {
        const state = await this.stateManager.loadProjectState(this.projectPath);
        res.json(state);
      } catch (error) {
        console.error('[ERRO] Falha ao carregar estado do projeto:', error.message);
        res.status(500).json({ 
          error: 'Falha ao carregar estado do projeto',
          message: error.message 
        });
      }
    });

    // API para atualizar o estado do projeto
    this.router.put('/api/state', express.json(), async (req, res) => {
      try {
        const updates = req.body;
        if (!updates || Object.keys(updates).length === 0) {
          return res.status(400).json({ error: 'Nenhuma atualização fornecida' });
        }

        // Carregar o estado atual
        const currentState = await this.stateManager.loadProjectState(this.projectPath);
        
        // Aplicar as atualizações
        const result = await this.stateManager.updateProjectState(updates);
        
        res.json({ 
          success: true, 
          message: 'Estado do projeto atualizado com sucesso',
          result 
        });
      } catch (error) {
        console.error('[ERRO] Falha ao atualizar estado do projeto:', error.message);
        res.status(500).json({ 
          error: 'Falha ao atualizar estado do projeto',
          message: error.message 
        });
      }
    });

    // API para gerar prompt de continuidade
    this.router.get('/api/prompt', async (req, res) => {
      try {
        const state = await this.stateManager.loadProjectState(this.projectPath);
        const prompt = this.stateManager.generateContinuityPrompt(state);
        res.json({ prompt });
      } catch (error) {
        console.error('[ERRO] Falha ao gerar prompt de continuidade:', error.message);
        res.status(500).json({ 
          error: 'Falha ao gerar prompt de continuidade',
          message: error.message 
        });
      }
    });

    // Endpoint de status/saúde
    this.router.get('/api/status', (req, res) => {
      res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.9'
      });
    });
  }

  /**
   * Obtém o roteador Express configurado
   * @returns {express.Router} Roteador Express
   */
  getRouter() {
    return this.router;
  }
}

export default WebController;
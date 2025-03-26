#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCPServer } from './mcp/server.js';
import { WebController } from './web/controller.js';
import { StateManager } from './services/stateManager.js';
import { basicAuthMiddleware } from './web/auth.js';

// Configuração do ambiente
dotenv.config();

// Detectar se estamos rodando via MCP (sem argumentos) ou como servidor web
const isMCPMode = process.argv.length <= 2;

if (isMCPMode) {
  // Modo MCP - usar StdioServerTransport
  console.error("Iniciando em modo MCP..."); // Use console.error para logs 
  
  // Inicializa o servidor MCP
  const mcpServer = new MCPServer();
  
  // Inicia o servidor MCP
  mcpServer.start().catch(err => {
    console.error("[ERRO] Falha ao iniciar servidor MCP:", err);
    process.exit(1);
  });
  
  // Tratamento de encerramento
  process.on('SIGINT', async () => {
    console.error('Encerrando servidor MCP...');
    await mcpServer.stop();
    process.exit(0);
  });
} else {
  // Modo servidor web - inicializar Express e MCP
  // Configuração do diretório atual (para ES modules)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());
  app.use(cors());
  
  // Middleware de autenticação
  app.use(basicAuthMiddleware({
    enabled: process.env.AUTH_ENABLED === 'true',
    realm: process.env.AUTH_REALM || 'MCP Continuity Server',
    username: process.env.AUTH_USERNAME || 'admin',
    password: process.env.AUTH_PASSWORD || 'password'
  }));
  
  // Servir arquivos estáticos
  app.use(express.static(path.join(__dirname, 'web/assets')));

  // Inicializa os serviços
  const stateManager = new StateManager();
  
  // Inicializa o servidor MCP
  const mcpServer = new MCPServer();
  
  // Inicializa o controlador web
  const webController = new WebController({ stateManager });
  
  // Registra as rotas da interface web
  app.use('/', webController.getRouter());

  // Página inicial com documentação (backup caso a rota do WebController falhe)
  app.get('*', (req, res) => {
    res.redirect('/');
  });

  // Inicia o servidor Express
  app.listen(PORT, () => {
    console.log(`[INFO] MCP Continuity Server rodando na porta ${PORT}`);
    
    // Verifica se a autenticação está habilitada
    if (process.env.AUTH_ENABLED === 'true') {
      console.log('[INFO] Autenticação básica habilitada');
    } else {
      console.log('[AVISO] Autenticação básica desabilitada - considere habilitar em produção');
    }
    
    console.log('[INFO] Interface web disponível em http://localhost:' + PORT);
    console.log('[INFO] Documentação: https://github.com/Lucasdoreac/mcp-continuity-server-fixed');
    
    // Inicia o servidor MCP
    mcpServer.start().catch(err => {
      console.error("[ERRO] Falha ao iniciar servidor MCP:", err);
    });
  });

  // Tratamento de encerramento
  process.on('SIGINT', async () => {
    console.log('[INFO] Encerrando servidor...');
    await mcpServer.stop();
    process.exit(0);
  });
}
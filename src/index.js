#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { MCPServer } from './mcp/server.js';

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
    console.error("Erro ao iniciar servidor MCP:", err);
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

  // Página inicial com documentação
  app.get('/', (req, res) => {
    res.send('MCP Continuity Server - Consulte a documentação em https://github.com/Lucasdoreac/mcp-continuity-server-fixed');
  });

  // Inicializa o servidor MCP
  const mcpServer = new MCPServer();

  // Inicia o servidor Express
  app.listen(PORT, () => {
    console.log(`MCP Continuity Server rodando na porta ${PORT}`);
    console.log('Documentação: https://github.com/Lucasdoreac/mcp-continuity-server-fixed');
    
    // Inicia o servidor MCP
    mcpServer.start();
  });

  // Tratamento de encerramento
  process.on('SIGINT', async () => {
    console.log('Encerrando servidor MCP...');
    await mcpServer.stop();
    process.exit(0);
  });
}
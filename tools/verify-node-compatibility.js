#!/usr/bin/env node

/**
 * Verifica a compatibilidade com a versão atual do Node.js
 * Este script é usado para testar o MCP Continuity Server em diferentes versões do Node.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do diretório atual (para ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar versão do Node.js
const nodeVersion = process.version;
const requiredVersion = '18.0.0';

console.log('[INFO] Verificando compatibilidade do Node.js...');
console.log(`[INFO] Versão atual do Node.js: ${nodeVersion}`);
console.log(`[INFO] Versão mínima requerida: ${requiredVersion}`);

// Verificar se a versão do Node.js é compatível
const currentVersion = nodeVersion.replace('v', '');
const currentParts = currentVersion.split('.').map(Number);
const requiredParts = requiredVersion.split('.').map(Number);

let isCompatible = true;
for (let i = 0; i < 3; i++) {
  if (currentParts[i] > requiredParts[i]) {
    break;
  }
  if (currentParts[i] < requiredParts[i]) {
    isCompatible = false;
    break;
  }
}

if (!isCompatible) {
  console.error(`[ERRO] A versão do Node.js v${currentVersion} não é compatível com o MCP Continuity Server.`);
  console.error(`[ERRO] Por favor, atualize para Node.js ${requiredVersion} ou superior.`);
  process.exit(1);
}

// Verificando módulos ES
try {
  console.log('[INFO] Verificando suporte a módulos ES...');
  // Testando importação dinâmica
  const dynamicImport = await import('../package.json', { assert: { type: 'json' } })
    .catch(() => import('../package.json'));
  
  console.log(`[INFO] Versão do pacote: ${dynamicImport.default.version}`);
  console.log('[OK] Suporte a módulos ES verificado com sucesso');
} catch (err) {
  console.error('[ERRO] Falha ao verificar suporte a módulos ES');
  console.error(err);
  process.exit(1);
}

// Verificar dependências essenciais
try {
  console.log('[INFO] Verificando dependências essenciais...');
  
  // Testando Express
  await import('express');
  console.log('[OK] Express: importado com sucesso');
  
  // Testando SDK MCP
  await import('@modelcontextprotocol/sdk');
  console.log('[OK] SDK MCP: importado com sucesso');
  
  // Testando fs-extra
  await import('fs-extra');
  console.log('[OK] fs-extra: importado com sucesso');
  
  // Testando cors
  await import('cors');
  console.log('[OK] cors: importado com sucesso');
  
  // Testando dotenv
  await import('dotenv');
  console.log('[OK] dotenv: importado com sucesso');
  
} catch (err) {
  console.error('[ERRO] Falha ao verificar dependências essenciais');
  console.error(err);
  process.exit(1);
}

console.log('[OK] Todas as verificações de compatibilidade foram concluídas com sucesso!');
console.log('[INFO] O MCP Continuity Server é compatível com esta versão do Node.js.');

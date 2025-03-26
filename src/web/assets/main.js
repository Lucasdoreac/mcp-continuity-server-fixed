/**
 * Script principal da interface web do MCP Continuity Server
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configurações iniciais
    const defaultApiEndpoint = 'http://localhost:3000/api';
    const defaultRefreshInterval = 30; // segundos
    
    // Carregar configurações do localStorage
    const apiEndpoint = localStorage.getItem('mcp_api_endpoint') || defaultApiEndpoint;
    const refreshInterval = parseInt(localStorage.getItem('mcp_refresh_interval')) || defaultRefreshInterval;
    
    // Atualizar os campos do formulário de configurações
    document.getElementById('apiEndpoint').value = apiEndpoint;
    document.getElementById('refreshInterval').value = refreshInterval;
    
    // Iniciar o carregamento de dados
    fetchData();
    
    // Configurar atualização automática
    let refreshTimer = setInterval(fetchData, refreshInterval * 1000);
    
    // Event listeners
    document.getElementById('refreshButton').addEventListener('click', fetchData);
    document.getElementById('saveSettings').addEventListener('click', function() {
        saveSettings();
        
        // Reiniciar o temporizador com as novas configurações
        clearInterval(refreshTimer);
        const newInterval = parseInt(localStorage.getItem('mcp_refresh_interval')) || defaultRefreshInterval;
        refreshTimer = setInterval(fetchData, newInterval * 1000);
    });
});

/**
 * Busca os dados do projeto da API
 */
function fetchData() {
    const apiEndpoint = localStorage.getItem('mcp_api_endpoint') || 'http://localhost:3000/api';
    
    // Mostrar indicador de carregamento
    document.getElementById('refreshButton').disabled = true;
    document.getElementById('refreshButton').textContent = 'Atualizando...';
    
    fetch(`${apiEndpoint}/state`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Atualizar a interface com os dados
            updateUI(data);
        })
        .catch(error => {
            console.error('Erro ao buscar dados:', error);
            // Exibir mensagem de erro na interface
            showError(`Falha ao carregar dados: ${error.message}`);
        })
        .finally(() => {
            // Restaurar o botão
            document.getElementById('refreshButton').disabled = false;
            document.getElementById('refreshButton').textContent = 'Atualizar';
        });
}

/**
 * Atualiza a interface com os dados recebidos
 * @param {Object} data - Dados do projeto
 */
function updateUI(data) {
    // Info do projeto
    document.getElementById('projectName').textContent = data.projectInfo.name;
    document.getElementById('projectRepo').innerHTML = `<a href="${data.projectInfo.repository}" target="_blank">${data.projectInfo.repository}</a>`;
    document.getElementById('projectVersion').textContent = data.projectInfo.version;
    document.getElementById('workingDir').textContent = data.projectInfo.workingDirectory || 'Raiz do projeto';
    document.getElementById('lastUpdated').textContent = new Date(data.projectInfo.lastUpdated).toLocaleString();

    // Componente atual
    document.getElementById('currentComponent').textContent = data.development.currentComponent;
    document.getElementById('currentDescription').textContent = data.development.inProgress.description;
    
    // Lista de tarefas
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    data.development.inProgress.remainingTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = task;
        taskList.appendChild(li);
    });

    // Componentes completados
    const completedList = document.getElementById('completedList');
    completedList.innerHTML = '';
    if (data.components.completed.length === 0) {
        completedList.textContent = 'Nenhum componente concluído.';
    } else {
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        data.components.completed.forEach(component => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.textContent = component.name;
            const badge = document.createElement('span');
            badge.className = `badge status-badge ${getPriorityClass(component.priority)}`;
            badge.textContent = getPriorityText(component.priority);
            li.appendChild(badge);
            ul.appendChild(li);
        });
        completedList.appendChild(ul);
    }

    // Componentes em progresso
    const inProgressList = document.getElementById('inProgressList');
    inProgressList.innerHTML = '';
    if (data.components.inProgress.length === 0) {
        inProgressList.textContent = 'Nenhum componente em progresso.';
    } else {
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        data.components.inProgress.forEach(component => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.textContent = component.name;
            const badge = document.createElement('span');
            badge.className = `badge status-badge ${getPriorityClass(component.priority)}`;
            badge.textContent = getPriorityText(component.priority);
            li.appendChild(badge);
            ul.appendChild(li);
        });
        inProgressList.appendChild(ul);
    }

    // Componentes pendentes
    const pendingList = document.getElementById('pendingList');
    pendingList.innerHTML = '';
    if (data.components.pending.length === 0) {
        pendingList.textContent = 'Nenhum componente pendente.';
    } else {
        const ul = document.createElement('ul');
        ul.className = 'list-group';
        data.components.pending.forEach(component => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.textContent = component.name;
            const badge = document.createElement('span');
            badge.className = `badge status-badge ${getPriorityClass(component.priority)}`;
            badge.textContent = getPriorityText(component.priority);
            li.appendChild(badge);
            ul.appendChild(li);
        });
        pendingList.appendChild(ul);
    }

    // Contexto
    document.getElementById('lastThought').textContent = data.context.lastThought;
    
    // Próximos passos
    const nextStepsList = document.getElementById('nextStepsList');
    nextStepsList.innerHTML = '';
    data.context.nextSteps.forEach(step => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = step;
        nextStepsList.appendChild(li);
    });
}

/**
 * Retorna a classe CSS para a prioridade
 * @param {string} priority - Prioridade (high, medium, low)
 * @returns {string} Classe CSS
 */
function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'bg-danger';
        case 'medium': return 'bg-warning';
        case 'low': return 'bg-info';
        default: return 'bg-secondary';
    }
}

/**
 * Retorna o texto para a prioridade
 * @param {string} priority - Prioridade (high, medium, low)
 * @returns {string} Texto
 */
function getPriorityText(priority) {
    switch(priority) {
        case 'high': return 'Alta';
        case 'medium': return 'Média';
        case 'low': return 'Baixa';
        default: return 'Desconhecida';
    }
}

/**
 * Salva as configurações da interface
 */
function saveSettings() {
    const apiEndpoint = document.getElementById('apiEndpoint').value;
    const refreshInterval = document.getElementById('refreshInterval').value;
    
    // Salvar em localStorage
    localStorage.setItem('mcp_api_endpoint', apiEndpoint);
    localStorage.setItem('mcp_refresh_interval', refreshInterval);
    
    console.log('Configurações salvas:', { apiEndpoint, refreshInterval });
    
    // Fechar modal
    const settingsModal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
    settingsModal.hide();
    
    // Mostrar mensagem de sucesso
    showSuccess('Configurações salvas com sucesso!');
}

/**
 * Mostra uma mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
    // Implementar a exibição de mensagens de erro
    console.error(message);
    
    // Criar uma mensagem de alerta
    const alertEl = document.createElement('div');
    alertEl.className = 'alert alert-danger alert-dismissible fade show fixed-top m-3';
    alertEl.setAttribute('role', 'alert');
    alertEl.innerHTML = `
        <strong>Erro!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(alertEl);
    
    // Remover após alguns segundos
    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 150);
        }
    }, 5000);
}

/**
 * Mostra uma mensagem de sucesso
 * @param {string} message - Mensagem de sucesso
 */
function showSuccess(message) {
    // Criar uma mensagem de alerta
    const alertEl = document.createElement('div');
    alertEl.className = 'alert alert-success alert-dismissible fade show fixed-top m-3';
    alertEl.setAttribute('role', 'alert');
    alertEl.innerHTML = `
        <strong>Sucesso!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao corpo do documento
    document.body.appendChild(alertEl);
    
    // Remover após alguns segundos
    setTimeout(() => {
        if (alertEl.parentNode) {
            alertEl.classList.remove('show');
            setTimeout(() => alertEl.remove(), 150);
        }
    }, 3000);
}
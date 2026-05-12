// Check authentication
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'gestor') {
    window.location.href = 'login.html';
}

const stages = [
    'Aguardando início',
    'Análise',
    'Desenvolvimento',
    'Testes',
    'Concluído'
];

// Get all orders and filter by manager
let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
let myProjects = allOrders.filter(order => order.managerId === currentUser.id);

let currentProjectId = null;

// Elements
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const totalProjects = document.getElementById('totalProjects');
const activeProjects = document.getElementById('activeProjects');
const completedProjects = document.getElementById('completedProjects');
const projectsList = document.getElementById('projectsList');
const emptyState = document.getElementById('emptyState');
const progressModal = document.getElementById('progressModal');
const statusSelect = document.getElementById('statusSelect');
const stageSelect = document.getElementById('stageSelect');
const progressSlider = document.getElementById('progressSlider');
const progressValue = document.getElementById('progressValue');
const managerComment = document.getElementById('managerComment');

// Initialize
userName.textContent = currentUser.name;
userEmail.textContent = currentUser.email;

updateStats();
renderProjects();

// Event Listeners
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
});

progressSlider.addEventListener('input', (e) => {
    progressValue.textContent = e.target.value + '%';
});

// Functions
function updateStats() {
    totalProjects.textContent = myProjects.length;
    activeProjects.textContent = myProjects.filter(p => p.status === 'in-progress').length;
    completedProjects.textContent = myProjects.filter(p => p.status === 'completed').length;
}

function renderProjects() {
    if (myProjects.length === 0) {
        projectsList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    projectsList.innerHTML = myProjects.map(project => `
        <div class="project-card">
            <div class="project-header">
                <div class="project-info">
                    <div class="project-client">Cliente: ${project.userName}</div>
                    <div class="project-service">${project.icon} ${project.service}</div>
                    <div class="project-description">${project.description}</div>
                    <div class="project-date">Criado em ${formatDate(project.createdAt)}</div>
                </div>
                <div class="project-actions">
                    <button class="btn-update" onclick="openProgressModal('${project.id}')">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Atualizar
                    </button>
                    <div class="status-badge status-${project.status}">
                        ${getStatusText(project.status)}
                    </div>
                </div>
            </div>

            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-label">Progresso do Projeto</span>
                    <span class="progress-percent">${project.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${project.progress}%"></div>
                </div>

                <div class="stages">
                    ${stages.map((stage, index) => {
                        const isActive = stages.indexOf(project.currentStage) >= index;
                        const isCurrent = project.currentStage === stage;
                        return `
                            <div class="stage ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}">
                                <div class="stage-circle">${index + 1}</div>
                                <div class="stage-label">${stage}</div>
                                ${index < stages.length - 1 ? '<div class="stage-line"></div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function openProgressModal(projectId) {
    currentProjectId = projectId;
    const project = myProjects.find(p => p.id === projectId);

    if (project) {
        statusSelect.value = project.status;
        stageSelect.value = project.currentStage;
        progressSlider.value = project.progress;
        progressValue.textContent = project.progress + '%';
        managerComment.value = '';

        progressModal.classList.remove('hidden');
    }
}

function closeProgressModal() {
    progressModal.classList.add('hidden');
    currentProjectId = null;
}

function confirmUpdate() {
    if (!currentProjectId) return;

    const project = myProjects.find(p => p.id === currentProjectId);
    const projectInAll = allOrders.find(p => p.id === currentProjectId);

    if (project && projectInAll) {
        const newStatus = statusSelect.value;
        const newStage = stageSelect.value;
        const newProgress = parseInt(progressSlider.value);
        const comment = managerComment.value.trim();

        // Update project
        project.status = newStatus;
        project.currentStage = newStage;
        project.progress = newProgress;

        projectInAll.status = newStatus;
        projectInAll.currentStage = newStage;
        projectInAll.progress = newProgress;

        // Add comment if provided
        if (comment) {
            if (!project.comments) project.comments = [];
            if (!projectInAll.comments) projectInAll.comments = [];

            const newComment = {
                id: Date.now().toString(),
                author: currentUser.name,
                text: comment,
                date: new Date().toISOString().split('T')[0],
                isAdmin: true
            };

            project.comments.push(newComment);
            projectInAll.comments.push(newComment);
        }

        // Save to localStorage
        localStorage.setItem('allOrders', JSON.stringify(allOrders));

        // Update the client's orders if they exist
        const clientOrders = JSON.parse(localStorage.getItem('orders_' + project.userId)) || [];
        const clientOrder = clientOrders.find(o => o.id === currentProjectId);
        if (clientOrder) {
            clientOrder.status = newStatus;
            clientOrder.currentStage = newStage;
            clientOrder.progress = newProgress;
            if (comment && clientOrder.comments) {
                clientOrder.comments.push({
                    id: Date.now().toString(),
                    author: currentUser.name,
                    text: comment,
                    date: new Date().toISOString().split('T')[0],
                    isAdmin: true
                });
            }
            localStorage.setItem('orders_' + project.userId, JSON.stringify(clientOrders));
        }

        updateStats();
        renderProjects();
        closeProgressModal();

        alert('Projeto atualizado com sucesso!');
    }
}

function getStatusText(status) {
    const texts = {
        'pending': 'Aguardando',
        'in-progress': 'Em Andamento',
        'completed': 'Concluído'
    };
    return texts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

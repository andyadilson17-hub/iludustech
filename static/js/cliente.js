// ==========================
// ELEMENTOS
// ==========================
const newOrderBtn = document.getElementById('newOrderBtn');
const serviceForm = document.getElementById('serviceForm');
const closeFormBtn = document.getElementById('closeFormBtn');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const servicesGrid = document.getElementById('servicesGrid');
const orderForm = document.getElementById('orderForm');
const descriptionInput = document.getElementById('descriptionInput');
const submitOrderBtn = document.getElementById('submitOrderBtn');

// ==========================
// DADOS (apenas visual)
// ==========================
const services = [

    {
        id: 'web',
        name: 'Website',
        icon: '<i class="fa-solid fa-globe"></i>'
    },

    {
        id: 'system',
        name: 'Base De Dados',
        icon: '<i class="fa-solid fa-database"></i>'
    },

    {
        id: 'app',
        name: 'App Desktop',
        icon: '<i class="fa-solid fa-desktop"></i>'
    },

    {
        id: 'ui',
        name: 'UI/UX Design',
        icon: '<i class="fa-solid fa-pen-ruler"></i>'
    },

    {
        id: 'maintenance',
        name: 'Manutenção',
        icon: '<i class="fa-solid fa-screwdriver-wrench"></i>'
    },

    {
        id: 'support',
        name: 'Suporte Técnico',
        icon: '<i class="fa-solid fa-headset"></i>'
    }

];

let selectedService = null;
let lastNotificationId = 0;

const stages = [
    "Aguardando início",
    "Análise",
    "Desenvolvimento",
    "Testes",
    "Concluído"
];

// ==========================
// EVENTOS
// ==========================

// Abrir formulário
newOrderBtn.addEventListener('click', () => {

    // trocar para HOME
    switchSection("home");

    // ativar menu correto
    navItems.forEach(n => n.classList.remove('active'));

    document
        .querySelector('[data-target="home"]')
        .classList.add('active');

    // mostrar formulário
    dashboardContent.classList.add('hidden');

    serviceForm.classList.remove('hidden');

    // scroll suave
    serviceForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

});

// Fechar formulário
closeFormBtn.addEventListener('click', hideForm);
cancelFormBtn.addEventListener('click', hideForm);

// Submit (SEM salvar nada)
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!selectedService) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));

    fetch("/api/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: user.id,
            service: selectedService.name,
            description: descriptionInput.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "sucesso"){
            loadOrders(); // 🔥 recarrega pedidos


            hideForm();
        }
    });
});


function loadOrders(){
    const user = JSON.parse(localStorage.getItem("currentUser"));

    fetch(`/api/orders?user_id=${user.id}`)
    .then(res => res.json())
    .then(data => {

        console.log("DADOS DA API:", data); // 🔥 DEBUG

        fakeOrders = data.orders.map(order => {

        let calculatedProgress = 0;

        switch(order.stage){

            case "Aguardando início":
                calculatedProgress = 0;
                break;

            case "Análise":
                calculatedProgress = 25;
                break;

            case "Desenvolvimento":
                calculatedProgress = 50;
                break;

            case "Testes":
                calculatedProgress = 75;
                break;

            case "Concluído":
                calculatedProgress = 100;
                break;

            default:
                calculatedProgress = 0;
        }

        return {
            id: order.id,
            service: order.service,
            description: order.description,
            progress: calculatedProgress,
            currentStage: order.stage,
            status: order.status,
            createdAt: order.date
        };
    });

        console.log("FAKE ORDERS:", fakeOrders); // 🔥 DEBUG

        renderOrders();
        updateDashboard();
        renderHomeData();
        loadNotifications();

    })
    .catch(err => {
        console.error("ERRO:", err);
    });
}

function loadNotifications(){

    const user = JSON.parse(localStorage.getItem("currentUser"));

    fetch(`/api/notifications?user_id=${user.id}`)
    .then(res => res.json())
    .then(data => {

        if(data.status === "sucesso") {

            const unread = data.notifications.filter(n => !n.read);

            if(unread.length > 0){

                unread.forEach(notification =>{

                    if(notification.id > lastNotificationId){

                        showToast(notification.title);
                        lastNotificationId = notification.id;
                    }

                });

                playNotificationSound();
            }

            renderNotifications(data.notifications);
            updateNotificationBadge(data.notifications);
        }

    })
    .catch(err => {
        console.error("ERRO NOTIFICATIONS:", err);
    });
}

// Ativar botão
descriptionInput.addEventListener('input', updateSubmitButton);

// ==========================
// FUNÇÕES
// ==========================

// Esconder formulário
function hideForm() {
    serviceForm.classList.add('hidden');
    dashboardContent.classList.remove('hidden');

    orderForm.reset();
    selectedService = null;
    renderServices();
    submitOrderBtn.disabled = true;
}

// Renderizar serviços
function renderServices() {
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-id="${service.id}">
            <div class="service-icon">${service.icon}</div>
            <div class="service-name">${service.name}</div>
        </div>
    `).join('');

    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('click', () => {
            const serviceId = card.dataset.id;
            selectedService = services.find(s => s.id === serviceId);

            document.querySelectorAll('.service-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            updateSubmitButton();
        });
    });
}

// Ativar botão Criar Pedido
function updateSubmitButton() {
    submitOrderBtn.disabled = !selectedService || !descriptionInput.value.trim();
}

// Inicializar
renderServices();

// ==========================
// DASHBOARD DINÂMICA (APENAS UI)
// ==========================

function updateDashboard() {
    const total = fakeOrders.length;

    const inProgress = fakeOrders.filter(o => o.status === 'Em Desenvolvimento').length;
    const completed = fakeOrders.filter(o => o.status === 'Concluído').length;
    const pending = fakeOrders.filter(o => o.status === 'Em Espera').length;

    document.getElementById('totalOrders').textContent = total;
    document.getElementById('inProgress').textContent = inProgress;
    document.getElementById('completed').textContent = completed;
    document.getElementById('pending').textContent = pending;

    const progress = total
        ? Math.floor(fakeOrders.reduce((sum, o) => sum + o.progress, 0) / total)
        : 0;

    document.getElementById('globalProgress').style.width = progress + "%";
}


// ======================================
// atualizado - estatísticas menu sobre
// ======================================

function updateAboutStats(){

    document.getElementById("aboutTotalOrders").textContent =
        fakeOrders.length;

    document.getElementById("aboutProgressOrders").textContent =
        fakeOrders.filter(o =>
            o.currentStage !== "Concluído"
        ).length;

    document.getElementById("aboutCompletedOrders").textContent =
        fakeOrders.filter(o =>
            o.currentStage === "Concluído"
        ).length;
}


function renderHomeData(){

    // =========================
    // NOTIFICAÇÕES
    // =========================

   // atualizado
    const notificationsList = document.getElementById("notificationsList");

    fetch(`/api/notifications?user_id=${JSON.parse(localStorage.getItem("currentUser")).id}`)

    .then(res => res.json())

    .then(data => {

        notificationsList.innerHTML = "";

        if(data.notifications.length === 0){

            notificationsList.innerHTML = `
                <div class="empty-notifications">
                    Nenhuma notificação
                </div>
            `;

            return;
        }

        data.notifications.slice(0, 2).forEach(notification => {

            let icon = "fa-bell";

            if(notification.type === "sucesso"){
                icon = "fa-circle-check";
            }

            if(notification.type === "progresso"){
                icon = "fa-rotate";
            }

            if(notification.type === "concluido"){
                icon = "fa-trophy";
            }

            notificationsList.innerHTML += `

                <div class="mini-notification-card">

                    <div class="mini-notification-icon">
                        <i class="fa-solid ${icon}"></i>
                    </div>

                    <div class="mini-notification-content">

                        <h4>${notification.title}</h4>

                        <p>${notification.message}</p>

                    </div>

                </div>

            `;
        });

    });


    // =========================
    // ATIVIDADES
    // =========================

// atualizado
const activityList = document.getElementById("activityList");

fetch(`/api/notifications?user_id=${JSON.parse(localStorage.getItem("currentUser")).id}`)

.then(res => res.json())

.then(data => {

    activityList.innerHTML = "";

    if(data.notifications.length === 0){

        activityList.innerHTML = `
            <div class="empty-notifications">
                Nenhuma atividade
            </div>
        `;

        return;
    }

    data.notifications.slice(0, 2).forEach(notification => {

        let icon = "fa-clock";

        if(notification.type === "sucesso"){
            icon = "fa-circle-plus";
        }

        if(notification.type === "progresso"){
            icon = "fa-spinner";
        }

        if(notification.type === "concluido"){
            icon = "fa-trophy";
        }

        activityList.innerHTML += `

            <div class="activity-item">

                <div class="activity-icon">
                    <i class="fa-solid ${icon}"></i>
                </div>

                <div class="activity-content">

                    <strong>
                        ${notification.title}
                    </strong>

                    <p>
                        ${notification.message}
                    </p>

                </div>

            </div>

        `;
    });

});
}

const dashboardContent = document.getElementById('dashboardContent');

function renderNotifications(notifications) {

    const list = document.getElementById("fullnotificationsList");

    if(notifications.length === 0){

        list.innerHTML = `
            <div class="empty-notifications">
                Nenhuma notificação ainda
            </div>
        `;

        return;
    }

    list.innerHTML = notifications.map(n => {

        let icon = "fa-bell";
        let className = "";

        // atualizado
        if(!n.read){
            className = "notification-unread";
        }

        // atualizado
        if(n.type === "sucesso"){
            icon = "fa-circle-check";
        }

        if(n.type === "progresso"){
            icon = "fa-rotate";
        }

        if(n.type === "concluido"){
            icon = "fa-trophy";
        }

        if(n.type === "erro"){
            icon = "fa-circle-xmark";
        }

        return `

            <div 
                class="notification-item ${className}"

                onclick="markNotificationAsRead(${n.id})"
            >

                <div class="notification-icon">

                    <i class="fa-solid ${icon}"></i>

                </div>

                <div class="notification-content">

                    <div class="notification-header">

                        <h3>${n.title}</h3>

                        <span>${n.date}</span>

                    </div>

                    <p>${n.message}</p>

                    ${
                        n.order_id
                        ?

                        `
                            <button
                                class="view-order-btn"

                                onclick="
                                    event.stopPropagation();
                                    viewOrderFromNotification(
                                        ${n.order_id},
                                        ${n.id}
                                    )
                                "
                            >

                                <i class="fa-solid fa-arrow-up-right-from-square"></i>

                                Ver Pedido

                            </button>
                        `
                        :

                        ""
                    }

                </div>

            </div>

        `;

    }).join("");
}



// atualizado
function viewOrderFromNotification(orderId, notificationId){

    // marca como lida
    markNotificationAsRead(notificationId);

    // abrir menu pedidos
    switchSection("orders");

    // ativar menu visualmente
    navItems.forEach(n => n.classList.remove("active"));

    document
        .querySelector('[data-target="orders"]')
        .classList.add("active");

    // esperar render
    setTimeout(() => {

        const card = document.querySelector(
            `[data-order-id="${orderId}"]`
        );

        if(card){

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

            card.classList.add("highlight-order");

            setTimeout(() => {

                card.classList.remove("highlight-order");

            }, 3000);
        }

    }, 300);
}




function markNotificationAsRead(id){

    fetch(`/api/notification/read/${id}`, {

        method: "PUT"

    })
    .then(() => {

        loadNotifications();

    });
}

function updateNotificationBadge(notifications){

    const badge = document.getElementById("notificationBadge");

    const unread = notifications.filter(n => !n.read);

    if(unread.length <= 0){

        badge.classList.add("hidden");
        return;
    }

    badge.classList.remove("hidden");

    badge.textContent = unread.length;
}

// ==========================
// MENU FUNCIONAL + ANIMAÇÃO
// ==========================

const navItems = document.querySelectorAll('.nav-item');

const sections = {
    home: document.getElementById('homeSection'),
    orders: document.getElementById('ordersSection'),
    notifications: document.getElementById('notificationsSection'),
    feedback: document.getElementById('feedbackSection'),
    about: document.getElementById('aboutSection')
};

// garantir estado inicial
Object.values(sections).forEach(sec => {
    sec.classList.add('hidden');
    sec.classList.remove('active');
});

// mostrar HOME ao iniciar
sections.home.classList.remove('hidden');
setTimeout(() => {
    sections.home.classList.add('active');
}, 50);

// trocar secção about
function switchSection(target) {

    const current = document.querySelector('.page-section.active');
    const next = sections[target];

    if (!next || current === next) return;

    // saída suave
    current.classList.remove('active');

    setTimeout(() => {
        current.classList.add('hidden');

        // entrada suave
        next.classList.remove('hidden');

        // truque stripe (força render)
        requestAnimationFrame(() => {
            next.classList.add('active');
        });

    }, 300);
}

// eventos menu
navItems.forEach(btn => {
    btn.addEventListener('click', () => {

        const target = btn.dataset.target;

        if (!sections[target]) return; // proteção

        switchSection(target);

        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');
    });
});



function renderOrders() {
    

    let statusClass = "";
    let statusText = "";

    switch(status){

        case "Em Espera":
            statusClass = "status-pending";
            statusText = "Em Espera";
            break;

        case "Em Desenvolvimento":
            statusClass = "status-progress";
            statusText = "Em Desenvolvimento";
            break;

        case "Concluído":
            statusClass = "status-completed";
            statusText = "Concluído";
            break;

        default:
            statusClass = "status-pending";
            statusText = status || "Pendente";
    }

    const ordersList = document.getElementById('ordersList');

    if (fakeOrders.length === 0) {
        ordersList.innerHTML = "<p>Nenhum pedido ainda</p>";
        return;
    }

    ordersList.innerHTML = fakeOrders.map(order => `
        
        
        <div class="order-card" data-order-id="${order.id}">

            <div class="order-header">
                <div class="order-top">

                    <div class="order-status ${statusClass}">
                        ${statusText}
                    </div>

                    <div class="order-info">
                        <div class="order-icon">

                            ${
                                order.service === "Website"
                                ? '<i class="fa-solid fa-globe"></i>'

                                : order.service === "Base De Dados"
                                ? '<i class="fa-solid fa-database"></i>'

                                : order.service === "App Desktop"
                                ? '<i class="fa-solid fa-desktop"></i>'

                                : order.service === "UI/UX Design"
                                ? '<i class="fa-solid fa-pen-ruler"></i>'

                                : order.service === "Manutenção"
                                ? '<i class="fa-solid fa-screwdriver-wrench"></i>'

                                : order.service === "Suporte Técnico"
                                ? '<i class="fa-solid fa-headset"></i>'

                                : '<i class="fa-solid fa-layer-group"></i>'
                            }

                        </div>

                        <div>
                            <div class="order-service">${order.service || "Serviço"}</div>
                            <div class="order-description">${order.description || "Sem descrição"}</div>

                            <div class="order-details">
                                <p>📅 Início: ${order.createdAt || "Hoje"}</p>
                                <p>⚙️ Tipo: ${order.service || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div class="progress-section">
                <div class="progress-header">
                    <span class="progress-label">Progresso do Projeto</span>
                    <span class="progress-percent">${order.progress || 0}%</span>
                </div>

                <div class="progress-bar">
                    <div class="progress-fill" style="width:${order.progress || 0}%"></div>
                </div>

                <div class="stages">
                    ${stages.map((stage, index) => {

                        const currentIndex = stages.indexOf(order.currentStage);
                        const isActive = index <= currentIndex;
                        const isCurrent = index === stage;

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

function showToast(message){

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = message;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 4500);
}

function playNotificationSound(){

    const sound = document.getElementById("notificationSound");

    sound.play();
}

// atualizado
let notificationsInitialized = false;

// atualizado
function startNotificationPolling(){

    setInterval(async () => {

        const user = JSON.parse(
            localStorage.getItem("currentUser")
        );

        try{

            const response = await fetch(
                `/api/notifications?user_id=${user.id}`
            );

            const data = await response.json();

            if(data.status !== "sucesso") return;

            // primeira carga
            if(!notificationsInitialized){

                renderNotifications(data.notifications);
                updateNotificationBadge(data.notifications);

                notificationsInitialized = true;

                // guardar último ID
                if(data.notifications.length > 0){

                    lastNotificationId =
                        data.notifications[0].id;
                }

                return;
            }

            // procurar nova notificação
            const newest = data.notifications[0];

            if(
                newest &&
                newest.id > lastNotificationId
            ){

                lastNotificationId = newest.id;

                // atualizar UI
                renderNotifications(data.notifications);

                updateNotificationBadge(data.notifications);

                renderHomeData();

                // toast
                showToast(newest.title);

                // som
                playNotificationSound();
            }

        }catch(err){

            console.log(
                "Erro polling notifications:",
                err
            );
        }

    }, 30000);
}

document.addEventListener("DOMContentLoaded", () => {

    loadOrders();

    loadNotifications();

    // atualizado
    startNotificationPolling();

});

function goToOrder(event, orderId){

    event.stopPropagation();

    // abrir menu pedidos
    switchSection("orders");

    // ativar menu lateral
    navItems.forEach(n => n.classList.remove("active"));

    document
        .querySelector('[data-target="orders"]')
        .classList.add("active");

    setTimeout(() => {

        const orderCard = document.getElementById(`order-${orderId}`);

        if(orderCard){

            orderCard.scrollIntoView({

                behavior: "smooth",
                block: "center"

            });

            // destaque
            orderCard.classList.add("highlight-order");

            setTimeout(() => {

                orderCard.classList.remove("highlight-order");

            }, 3500);
        }

    }, 400);
}

function updateStars(){

    stars.forEach(star => {

        const value = parseInt(star.dataset.star);

        if(value <= selectedRating){
            star.classList.add("star-active");
            star.textContent = "★";
        }else{
            star.classList.remove("star-active");
            star.textContent = "☆";
        }

    });

}


// ==========================
// FEEDBACK STARS  Mais recente
// ==========================

const stars = document.querySelectorAll(".star-btn");

let selectedRating = 0;

stars.forEach((star, index) => {

    star.addEventListener("click", () => {

        selectedRating = index + 1;

        stars.forEach((s, i) => {

            if(i < selectedRating){

                s.classList.add("active");

            }else{

                s.classList.remove("active");
            }

        });

    });

});




// =========================
// USER INFO
// =========================

// atualizado
const currentUser = JSON.parse(
    localStorage.getItem("currentUser")
);

if(currentUser){

    document.getElementById(
        "sidebarUserName"
    ).textContent = currentUser.nome;
}

// =========================
// LOGOUT
// =========================

// atualizado

const logoutBtn = document.getElementById("logoutBtn");

const logoutModal = document.getElementById("logoutModal");

const cancelLogout =
    document.getElementById("cancelLogout");

const confirmLogout =
    document.getElementById("confirmLogout");


// atualizado
logoutBtn.addEventListener("click", () => {

    logoutModal.classList.remove("hidden");

});

// atualizado
cancelLogout.addEventListener("click", () => {

    logoutModal.classList.add("hidden");

});

// atualizado
confirmLogout.addEventListener("click", () => {

    localStorage.removeItem("currentUser");

    window.location.href = "/login";

});

// =========================
// MOBILE MENU
// =========================

// atualizado notification
mobileMenuBtn.addEventListener("click", () => {

    sidebar.classList.toggle("sidebar-open");

});
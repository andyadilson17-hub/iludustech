// =========================
// ELEMENTOS
// =========================

const toastContainer = document.getElementById('toastContainer');
const logoutBtn = document.getElementById('logouBtn');
const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab-content');

const ordersTable =
document.getElementById('ordersTable');

const progressPopup =
document.getElementById('progressPopup');

const closeProgressPopup =
document.getElementById('closeProgressPopup');

// =========================
// DADOS VISUAIS
// (SEM LOCAL STORAGE)
// =========================

let orders = [];

// =========================
// MENU
// =========================

navItems.forEach(item => {

    item.addEventListener('click', () => {

        const target = item.dataset.tab;

        // remover active menu
        navItems.forEach(nav => {
            nav.classList.remove('active');
        });

        item.classList.add('active');

        // esconder tabs
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // mostrar tab
        document
            .getElementById(`${target}-tab`)
            .classList.add('active');

    });

});

// =========================
// RENDER TABELA
// =========================

function renderOrders(){

    ordersTable.innerHTML = orders.map(order => `

        <tr>

            <td>#${order.id}</td>

            <td>${order.cliente}</td>

            <td>${order.servico}</td>

            <td>

                <span class="
                    badge
                    ${order.progress === 100
                        ? 'badge-completed'
                        : 'badge-in-progress'}
                ">
                    ${order.etapa}
                </span>

            </td>

            <td>

                <div class="progress-mini">

                    <div class="progress-bar-mini">

                        <div 
                            class="progress-fill-mini"
                            style="width:${order.progress}%">
                        </div>

                    </div>

                    <span class="progress-text-mini">
                        ${order.progress}%
                    </span>

                </div>

            </td>

            <td class="actions-cell">

                <button class="btn-update-progress" data-id = "${order.id}">
                    Atualizar
                </button>

            </td>

        </tr>

    `).join('');

}

loadOrders();

// =========================
// POPUP PROGRESSO
// =========================

let currentRow = null;
let currentOrderId = null;

// abrir popup

document.addEventListener('click', (e) => {

    if(
        e.target.classList.contains(
            'btn-update-progress'
        )
    ){

        currentRow =
        e.target.closest('tr');

        currentOrderId =
        e.target.dataset.id;

        progressPopup.classList.remove('hidden');

    }

});

// fechar popup

closeProgressPopup.addEventListener('click', () => {

    progressPopup.classList.add('hidden');

});

// clicar fora

progressPopup.addEventListener('click', (e) => {

    if(e.target === progressPopup){

        progressPopup.classList.add('hidden');

    }

});

// =========================
// ATUALIZAR PROGRESSO
// =========================

const progressOptions =
document.querySelectorAll('.progress-option');

progressOptions.forEach(option => {

    option.addEventListener('click', () => {

        const progress =
        option.dataset.progress;

        let etapa = "Análise";

        if(progress == 25){
            etapa = "Análise";
        }

        else if(progress == 50){
            etapa = "Desenvolvimento";
        }

        else if(progress == 75){
            etapa = "Testes";
        }

        else if(progress == 100){
            etapa = "Concluído";
        }

        // barra
        const fill =
        currentRow.querySelector(
            '.progress-fill-mini'
        );

        // texto
        const text =
        currentRow.querySelector(
            '.progress-text-mini'
        );

        fill.style.width = `${progress}%`;

        text.textContent = `${progress}%`;

        // badge
        const badge =
        currentRow.querySelector('.badge');

        if(progress == 25){

            badge.textContent = 'Análise';

            badge.className =
            'badge badge-in-progress';

        }

        else if(progress == 50){

            badge.textContent =
            'Desenvolvimento';

            badge.className =
            'badge badge-in-progress';

        }

        else if(progress == 75){

            badge.textContent = 'Testes';

            badge.className =
            'badge badge-in-progress';

        }

        else{

            badge.textContent =
            'Concluído';

            badge.className =
            'badge badge-completed';

        }

        fetch("/api/admin/update-order", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                order_id: currentOrderId,
                etapa: etapa

            })

        });


        progressPopup.classList.add('hidden');

        showToast(
            'Progresso atualizado com sucesso'
        );

        loadOrders();

    });

});

// =========================
// TOAST
// =========================

function showToast(message) {

    const toast = document.createElement('div');

    toast.className = 'toast';

    toast.innerHTML = `
        <strong>DevSolutions</strong>
        <p>${message}</p>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, 3000);

}

// ===============================
// LOGOUT UI
// ===============================

logoutBtn.addEventListener('click', () => {

    showToast('Sessão encerrada');

    setTimeout(() => {

        window.location.href = '/login';

    }, 1000);

});

// ===============================
// INIT
// ===============================

window.addEventListener('load', () => {

    showToast('Dashboard carregada com sucesso');

});

function loadOrders(){

    fetch("/api/admin/orders")

    .then(res => res.json())

    .then(data => {

        console.log("ADMIN ORDERS:", data);

        if(data.status === "sucesso"){

            orders = data.orders;

            renderOrders();

        }

    })

    .catch(err => {

        console.error(
            "ERRO LOAD ADMIN ORDERS:",
            err
        );

    });

}



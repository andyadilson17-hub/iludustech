// ========================================
// ATUALIZADO - MENU RESPONSIVO
// ========================================

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {

    navMenu.classList.toggle("active");

});

// ========================================
// FECHAR MENU AO CLICAR
// ========================================

document.querySelectorAll(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

        navMenu.classList.remove("active");

    });

});

// ========================================
// HEADER EFEITO SCROLL
// ========================================

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if(window.scrollY > 50){

        header.style.background = "rgba(255,255,255,0.95)";
        header.style.boxShadow = "0 10px 30px rgba(0,0,0,0.06)";

    }else{

        header.style.background = "rgba(255,255,255,0.8)";
        header.style.boxShadow = "none";

    }

});

// ========================================
// ANIMAÇÃO AO SCROLL
// ========================================

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";

        }

    });

},{
    threshold:0.1
});

document.querySelectorAll(`
    .about-card,
    .service-card,
    .process-card,
    .plan-card,
    .team-member,
    .timeline-item
`).forEach(el => {

    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "all 0.7s ease";

    observer.observe(el);

});

// ========================================
// PARTÍCULAS HERO
// atualizado
// ========================================

const particlesContainer = document.getElementById("particles");

function createParticle(){

    const particle = document.createElement("div");

    particle.classList.add("particle");

    // tamanho aleatório
    const size = Math.random() * 6 + 2;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    // posição aleatória
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = `-20px`;

    // duração
    const duration = Math.random() * 10 + 8;

    particle.style.animationDuration = `${duration}s`;

    // opacidade
    particle.style.opacity = Math.random();

    particlesContainer.appendChild(particle);

    // remover depois
    setTimeout(() => {

        particle.remove();

    }, duration * 1000);
}

// criar continuamente
setInterval(() => {

    createParticle();

}, 300);
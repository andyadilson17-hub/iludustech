const form = document.getElementById("adminLoginForm");

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const email =
    document.getElementById("email").value;

    const password =
    document.getElementById("password").value;

    const button = document.querySelector("button");

    button.classList.add("loading");

    fetch("/api/adminlogin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        button.classList.remove("loading");

        if (data.status === "sucesso") {
            localStorage.setItem("adminUser", JSON.stringify(data.admin));
            showToast("Login realizado com sucesso", "success");

            setTimeout(() => {
                window.location.href = "/admin";
            }, 800);
        }

        else if (data.status === "senha_incorreta") {
            showToast("Senha incorreta", "error");
            shakeForm();
        }

        else if (data.status === "nao_existe") {
            showToast("Administrador não encontrado", "error");
            shakeForm();
        }

        else {
            showToast("Erro no login", "error");
        }
    });

});

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function shakeForm() {
    const box = document.querySelector(".admin-login-box");
    box.classList.add("shake");

    setTimeout(() => {
        box.classList.remove("shake");
    }, 400);
}


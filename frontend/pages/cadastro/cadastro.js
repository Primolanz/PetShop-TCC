const API_URL = 'https://mania-de-bicho.onrender.com';

const form = document.getElementById('cadastroForm');
const toast = document.getElementById('toast');
const submitButton = form.querySelector('button[type="submit"]');
let toastTimeout;

function mostrarLoading(mostrar, texto = 'Conectando ao servidor...') {
    let loading = document.getElementById('loadingOverlay');

    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-card">
                <div class="loading-spinner" aria-hidden="true"></div>
                <h2>Mania de Bicho</h2>
                <p></p>
            </div>
        `;
        document.body.appendChild(loading);
    }

    loading.querySelector('p').textContent = texto;
    loading.classList.toggle('show', mostrar);
    loading.setAttribute('aria-hidden', mostrar ? 'false' : 'true');

    if (submitButton) {
        submitButton.disabled = mostrar;
    }
}

function mostrarToast(texto, tipo = 'error') {
    clearTimeout(toastTimeout);
    toast.textContent = texto;
    toast.className = `toast ${tipo} show`;

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        mostrarLoading(true, 'Acordando o servidor. Isso pode levar alguns segundos no plano gratuito.');

        const response = await fetch(`${API_URL}/api/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarToast(data.details ? data.details.join(' ') : data.error || 'Erro ao cadastrar.');
            return;
        }

        mostrarToast('Cadastro realizado. Redirecionando...', 'success');

        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 900);
    } catch (error) {
        mostrarToast('Nao foi possivel conectar ao servidor.');
    } finally {
        mostrarLoading(false);
    }
});

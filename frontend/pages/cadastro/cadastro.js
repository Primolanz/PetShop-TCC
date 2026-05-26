const API_URL = 'https://mania-de-bicho.onrender.com';

const form = document.getElementById('cadastroForm');
const toast = document.getElementById('toast');
let toastTimeout;

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
    }
});

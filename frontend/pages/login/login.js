const API_URL = 'https://mania-de-bicho.onrender.com';

const form = document.getElementById('loginForm');
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

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (!response.ok) {
            mostrarToast(data.details ? data.details.join(' ') : data.error || 'Erro ao fazer login.');
            return;
        }

        mostrarToast('Login realizado com sucesso. Redirecionando...', 'success');
        localStorage.setItem('petshop_token', data.token);

        setTimeout(() => {
            window.location.href = '../home/home.html';
        }, 700);
    } catch (error) {
        mostrarToast('Nao foi possivel conectar ao servidor.');
    }
});

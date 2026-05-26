const API_URL = 'https://mania-de-bicho.onrender.com';
const token = localStorage.getItem('petshop_token');

const state = {
    clientes: [],
    pets: [],
    agendamentos: []
};

if (!token) {
    window.location.href = '../login/login.html';
}

const $ = (id) => document.getElementById(id);
let toastTimeout;

function mostrarMensagem(texto, sucesso = false) {
    const toast = $('toast');
    clearTimeout(toastTimeout);
    toast.textContent = texto;
    toast.className = `toast ${sucesso ? 'success' : 'error'} show`;

    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3800);
}

function traduzirErro(mensagem) {
    if (mensagem.includes('Ja existe um agendamento ativo')) {
        return 'Horário já agendado por outro cliente.';
    }

    return mensagem;
}

function somenteNumeros(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function formatarTelefone(valor) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;

    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function formatarCpf(valor) {
    const numeros = somenteNumeros(valor).slice(0, 11);

    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;

    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function formatarCep(valor) {
    const numeros = somenteNumeros(valor).slice(0, 8);

    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
}

function aplicarMascara(input, formatador) {
    input.addEventListener('input', () => {
        input.value = formatador(input.value);
    });
}

function configurarPainelColapsavel(panelId, buttonId) {
    const panel = $(panelId);
    const button = $(buttonId);

    button.addEventListener('click', () => {
        const estaFechado = panel.classList.toggle('collapsed');
        button.textContent = estaFechado ? 'Abrir' : 'Fechar';
    });
}

function abrirPainel(panelId, buttonId) {
    $(panelId).classList.remove('collapsed');
    $(buttonId).textContent = 'Fechar';
}

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (response.status === 401) {
        localStorage.removeItem('petshop_token');
        window.location.href = '../login/login.html';
        return null;
    }

    if (!response.ok) {
        const detalhe = data.details ? ` ${data.details.join(' ')}` : '';
        throw new Error(traduzirErro(`${data.error || 'Erro na requisicao.'}${detalhe}`));
    }

    return data;
}

function normalizarHorario(valor) {
    if (!valor) return '';
    return valor.length === 5 ? `${valor}:00` : valor;
}

function formatarData(valor) {
    if (!valor) return '';
    return String(valor).slice(0, 10);
}

function renderClientes() {
    const lista = $('clientesLista');

    if (!state.clientes.length) {
        lista.innerHTML = '<p>Nenhum cliente encontrado.</p>';
        return;
    }

    lista.innerHTML = state.clientes.map((cliente) => `
        <article class="item">
            <div class="item-top">
                <div>
                    <h3>${cliente.nome}</h3>
                    <p>${formatarTelefone(cliente.telefone || '')} | ${cliente.email || 'Sem e-mail'}</p>
                    <p>${formatarCpf(cliente.cpf || '') || 'Sem CPF'} | ${cliente.endereco || 'Sem endereco'}</p>
                </div>
                <div class="item-actions">
                    <button class="btn secundario" type="button" onclick="editarCliente(${cliente.id_cliente})">Editar</button>
                    <button class="btn perigo" type="button" onclick="excluirCliente(${cliente.id_cliente})">Excluir</button>
                </div>
            </div>
        </article>
    `).join('');
}

function renderPets() {
    const lista = $('petsLista');

    if (!state.pets.length) {
        lista.innerHTML = '<p>Nenhum pet encontrado.</p>';
        return;
    }

    lista.innerHTML = state.pets.map((pet) => `
        <article class="item">
            <div class="item-top">
                <div>
                    <h3>${pet.nome}</h3>
                    <p>${pet.especie} | ${pet.raca || 'Sem raca'}</p>
                    <p>Dono: ${pet.nome_cliente || pet.cliente_id}</p>
                </div>
                <div class="item-actions">
                    <button class="btn secundario" type="button" onclick="editarPet(${pet.id_pet})">Editar</button>
                    <button class="btn perigo" type="button" onclick="excluirPet(${pet.id_pet})">Excluir</button>
                </div>
            </div>
        </article>
    `).join('');
}

function renderAgendamentos() {
    const lista = $('agendamentosLista');

    if (!state.agendamentos.length) {
        lista.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
        return;
    }

    lista.innerHTML = state.agendamentos.map((agendamento) => `
        <article class="item">
            <div class="item-top">
                <div>
                    <h3>${agendamento.nome_pet} - ${agendamento.servico}</h3>
                    <p>${formatarData(agendamento.data_servico)} às ${agendamento.horario_servico} | ${agendamento.status}</p>
                    <p>Cliente: ${agendamento.nome_cliente} | ${agendamento.observacao || 'Sem observacao'}</p>
                </div>
                <div class="item-actions">
                    <button class="btn secundario" type="button" onclick="editarAgendamento(${agendamento.id_agendamento})">Editar</button>
                    <button class="btn perigo" type="button" onclick="excluirAgendamento(${agendamento.id_agendamento})">Excluir</button>
                </div>
            </div>
        </article>
    `).join('');
}

function preencherSelects() {
    $('petCliente').innerHTML = '<option value="">Cliente dono</option>' + state.clientes.map((cliente) => (
        `<option value="${cliente.id_cliente}">${cliente.nome}</option>`
    )).join('');

    $('agendamentoPet').innerHTML = '<option value="">Pet</option>' + state.pets.map((pet) => (
        `<option value="${pet.id_pet}">${pet.nome} (${pet.nome_cliente || 'sem cliente'})</option>`
    )).join('');
}

async function carregarClientes() {
    const busca = $('buscaCliente').value.trim();
    const query = busca ? `?busca=${encodeURIComponent(busca)}&limit=50` : '?limit=50';
    const data = await apiRequest(`/api/clientes${query}`);
    state.clientes = data.data || [];
    renderClientes();
    preencherSelects();
}

async function carregarPets() {
    const busca = $('buscaPet').value.trim();
    const query = busca ? `?busca=${encodeURIComponent(busca)}&limit=50` : '?limit=50';
    const data = await apiRequest(`/api/pets${query}`);
    state.pets = data.data || [];
    renderPets();
    preencherSelects();
}

async function carregarAgendamentos() {
    const params = new URLSearchParams({ limit: '50' });
    const busca = $('buscaAgendamento').value.trim();
    const status = $('filtroStatus').value;

    if (busca) params.set('busca', busca);
    if (status) params.set('status', status);

    const data = await apiRequest(`/api/agendamentos?${params.toString()}`);
    state.agendamentos = data.data || [];
    renderAgendamentos();
}

async function carregarTudo() {
    try {
        await carregarClientes();
        await carregarPets();
        await carregarAgendamentos();
    } catch (error) {
        mostrarMensagem(error.message);
    }
}

function limparCliente() {
    $('clienteForm').reset();
    $('clienteId').value = '';
}

function limparPet() {
    $('petForm').reset();
    $('petId').value = '';
}

function limparAgendamento() {
    $('agendamentoForm').reset();
    $('agendamentoId').value = '';
}

window.editarCliente = (id) => {
    const cliente = state.clientes.find((item) => item.id_cliente === id);
    if (!cliente) return;

    abrirPainel('clientesPanel', 'toggleClientesBtn');
    $('clienteId').value = cliente.id_cliente;
    $('clienteNome').value = cliente.nome || '';
    $('clienteTelefone').value = formatarTelefone(cliente.telefone || '');
    $('clienteEmail').value = cliente.email || '';
    $('clienteCpf').value = formatarCpf(cliente.cpf || '');
    $('clienteEndereco').value = cliente.endereco || '';
    $('clienteCep').value = '';
    $('clienteNumero').value = '';
};

window.editarPet = (id) => {
    const pet = state.pets.find((item) => item.id_pet === id);
    if (!pet) return;

    abrirPainel('petsPanel', 'togglePetsBtn');
    $('petId').value = pet.id_pet;
    $('petNome').value = pet.nome || '';
    $('petEspecie').value = pet.especie || '';
    $('petRaca').value = pet.raca || '';
    $('petCliente').value = pet.cliente_id || '';
};

window.editarAgendamento = (id) => {
    const agendamento = state.agendamentos.find((item) => item.id_agendamento === id);
    if (!agendamento) return;

    $('agendamentoId').value = agendamento.id_agendamento;
    $('agendamentoPet').value = agendamento.pet_id || '';
    $('agendamentoServico').value = agendamento.servico || '';
    $('agendamentoData').value = formatarData(agendamento.data_servico);
    $('agendamentoHorario').value = String(agendamento.horario_servico || '').slice(0, 5);
    $('agendamentoStatus').value = agendamento.status || 'Agendado';
    $('agendamentoObservacao').value = agendamento.observacao || '';
};

window.excluirCliente = async (id) => {
    if (!confirm('Excluir este cliente?')) return;

    try {
        await apiRequest(`/api/clientes/${id}`, { method: 'DELETE' });
        mostrarMensagem('Cliente excluido com sucesso.', true);
        await carregarTudo();
    } catch (error) {
        mostrarMensagem(error.message);
    }
};

window.excluirPet = async (id) => {
    if (!confirm('Excluir este pet?')) return;

    try {
        await apiRequest(`/api/pets/${id}`, { method: 'DELETE' });
        mostrarMensagem('Pet excluido com sucesso.', true);
        await carregarTudo();
    } catch (error) {
        mostrarMensagem(error.message);
    }
};

window.excluirAgendamento = async (id) => {
    if (!confirm('Excluir este agendamento?')) return;

    try {
        await apiRequest(`/api/agendamentos/${id}`, { method: 'DELETE' });
        mostrarMensagem('Agendamento excluido com sucesso.', true);
        await carregarAgendamentos();
    } catch (error) {
        mostrarMensagem(error.message);
    }
};

$('clienteForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = $('clienteId').value;
    const body = {
        nome: $('clienteNome').value.trim(),
        telefone: $('clienteTelefone').value.trim(),
        email: $('clienteEmail').value.trim(),
        cpf: $('clienteCpf').value.trim(),
        endereco: $('clienteEndereco').value.trim(),
        cep: $('clienteCep').value.trim(),
        numero: $('clienteNumero').value.trim()
    };

    try {
        await apiRequest(id ? `/api/clientes/${id}` : '/api/clientes', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(body)
        });
        limparCliente();
        mostrarMensagem('Cliente salvo com sucesso.', true);
        await carregarTudo();
    } catch (error) {
        mostrarMensagem(error.message);
    }
});

$('petForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = $('petId').value;
    const body = {
        nome: $('petNome').value.trim(),
        especie: $('petEspecie').value.trim(),
        raca: $('petRaca').value.trim(),
        cliente_id: Number($('petCliente').value)
    };

    try {
        await apiRequest(id ? `/api/pets/${id}` : '/api/pets', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(body)
        });
        limparPet();
        mostrarMensagem('Pet salvo com sucesso.', true);
        await carregarTudo();
    } catch (error) {
        mostrarMensagem(error.message);
    }
});

$('agendamentoForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const id = $('agendamentoId').value;
    const body = {
        pet_id: Number($('agendamentoPet').value),
        servico: $('agendamentoServico').value,
        data_servico: $('agendamentoData').value,
        horario_servico: normalizarHorario($('agendamentoHorario').value),
        status: $('agendamentoStatus').value,
        observacao: $('agendamentoObservacao').value.trim()
    };

    try {
        await apiRequest(id ? `/api/agendamentos/${id}` : '/api/agendamentos', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(body)
        });
        limparAgendamento();
        mostrarMensagem('Agendamento salvo com sucesso.', true);
        await carregarAgendamentos();
    } catch (error) {
        mostrarMensagem(error.message);
    }
});

$('buscaCliente').addEventListener('input', carregarClientes);
$('buscaPet').addEventListener('input', carregarPets);
$('buscaAgendamento').addEventListener('input', carregarAgendamentos);
$('filtroStatus').addEventListener('change', carregarAgendamentos);
$('limparClienteBtn').addEventListener('click', limparCliente);
$('limparPetBtn').addEventListener('click', limparPet);
$('limparAgendamentoBtn').addEventListener('click', limparAgendamento);
$('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('petshop_token');
    window.location.href = '../login/login.html';
});

aplicarMascara($('clienteTelefone'), formatarTelefone);
aplicarMascara($('clienteCpf'), formatarCpf);
aplicarMascara($('clienteCep'), formatarCep);
aplicarMascara($('clienteNumero'), somenteNumeros);
configurarPainelColapsavel('clientesPanel', 'toggleClientesBtn');
configurarPainelColapsavel('petsPanel', 'togglePetsBtn');

carregarTudo();

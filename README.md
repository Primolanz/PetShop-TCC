# PetShop TCC - Sistema de Agendamento

Sistema desenvolvido como Trabalho de Conclusao de Curso, com foco no gerenciamento de um PetShop/clinica veterinaria.

A aplicacao possui uma API em Node.js com Express, banco de dados MySQL e frontend inicial em HTML/CSS.

## Funcionalidades

- Cadastro e login de usuarios
- Cadastro, listagem, edicao e exclusao de clientes
- Cadastro, listagem, edicao e exclusao de pets
- Cadastro, listagem, edicao e exclusao de agendamentos
- Protecao de rotas privadas com JWT
- Validacao dos dados enviados
- Busca, filtros e paginacao
- Consulta de endereco pelo ViaCEP
- Regras para evitar agendamentos invalidos

## Tecnologias

- Node.js
- Express
- MySQL
- mysql2
- bcryptjs
- jsonwebtoken
- dotenv
- cors
- nodemon
- HTML/CSS

## Estrutura do Projeto

```txt
TCC-PETSHOP/
|-- backend/
|   |-- database/
|   |   `-- schema.sql
|   |-- src/
|   |   |-- config/
|   |   |   `-- db.js
|   |   |-- controllers/
|   |   |   |-- agendamentoControllers.js
|   |   |   |-- authControllers.js
|   |   |   |-- clienteControllers.js
|   |   |   `-- petControllers.js
|   |   |-- middlewares/
|   |   |   |-- authMiddleware.js
|   |   |   `-- errorHandler.js
|   |   |-- routes/
|   |   |   |-- agendamentoRoutes.js
|   |   |   |-- authRoutes.js
|   |   |   |-- clienteRoutes.js
|   |   |   `-- petRoutes.js
|   |   |-- utils/
|   |   |   |-- responses.js
|   |   |   `-- validation.js
|   |   `-- server.js
|-- frontend/
|   `-- pages/
|-- package.json
`-- README.md
```

## Routes e Controllers

As rotas ficam responsaveis apenas por receber a URL e chamar uma funcao do controller.

Exemplo:

```js
router.post('/', criarCliente);
router.get('/', listarClientes);
router.put('/:id_cliente', atualizarCliente);
router.delete('/:id_cliente', excluirCliente);
```

A regra de negocio fica dentro dos controllers:

```txt
authRoutes.js          -> authControllers.js
clienteRoutes.js       -> clienteControllers.js
petRoutes.js           -> petControllers.js
agendamentoRoutes.js   -> agendamentoControllers.js
```

## Banco de Dados

O banco utilizado se chama:

```sql
petshop_db
```

As tabelas principais sao:

- `usuarios`
- `clientes`
- `pets`
- `agendamentos`

O script do banco esta em:

```txt
backend/database/schema.sql
```

Execute esse arquivo no MySQL Workbench ou em outro cliente MySQL.

Atencao: o script pode apagar e recriar o banco, entao use com cuidado se ja tiver dados salvos.

## Configuracao do Ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```txt
backend/.env
```

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=petshop_db
JWT_SECRET=sua_chave_secreta
```

## Como Instalar

Na raiz do projeto:

```bash
npm install
```

## Como Rodar

Modo desenvolvimento:

```bash
npm run dev
```

Modo normal:

```bash
npm start
```

Servidor esperado:

```txt
http://localhost:3000
```

Teste inicial:

```txt
GET http://localhost:3000/
```

Resposta:

```txt
Servidor do PetShop rodando e conectado!
```

## Como Usar no Postman

Use esta URL base:

```txt
http://localhost:3000
```

Para as requisicoes com JSON, va em:

```txt
Body > raw > JSON
```

Depois do login, copie o token e configure nas rotas privadas:

```txt
Authorization > Type: Bearer Token
Token: cole_o_token_aqui
```

As rotas privadas sao:

```txt
/api/clientes
/api/pets
/api/agendamentos
```

## 1. Registrar Usuario

```txt
POST http://localhost:3000/api/auth/registrar
```

Body:

```json
{
  "nome": "Admin",
  "email": "admin@petshop.com",
  "senha": "123456"
}
```

Resposta esperada:

```json
{
  "message": "Usuario cadastrado com sucesso!"
}
```

## 2. Fazer Login

```txt
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "admin@petshop.com",
  "senha": "123456"
}
```

Resposta esperada:

```json
{
  "message": "Login realizado com sucesso!",
  "token": "seu_token_jwt"
}
```

Copie o valor do `token`. Ele sera usado nas proximas rotas.

## 3. Configurar o Token no Postman

Em cada rota privada:

```txt
Authorization > Type: Bearer Token
Token: cole_o_token_do_login
```

Se tentar acessar sem token:

```txt
GET http://localhost:3000/api/clientes
```

Resposta esperada:

```json
{
  "error": "Token nao informado."
}
```

## 4. Cadastrar Cliente

```txt
POST http://localhost:3000/api/clientes
```

Body com endereco manual:

```json
{
  "nome": "Maria Souza",
  "telefone": "11999998888",
  "email": "maria@email.com",
  "cpf": "123.456.789-00",
  "endereco": "Rua das Flores, 123"
}
```

Body usando ViaCEP:

```json
{
  "nome": "Joao ViaCEP",
  "telefone": "11999998888",
  "email": "joao@email.com",
  "cpf": "111.222.333-44",
  "cep": "01001000",
  "numero": "123"
}
```

Resposta esperada:

```json
{
  "message": "Cliente cadastrado com sucesso!",
  "id_cliente": 1
}
```

## 5. Listar Clientes

```txt
GET http://localhost:3000/api/clientes
```

Com busca e paginacao:

```txt
GET http://localhost:3000/api/clientes?busca=maria&page=1&limit=5
```

## 6. Atualizar Cliente

Troque o `1` pelo ID real do cliente.

```txt
PUT http://localhost:3000/api/clientes/1
```

Body:

```json
{
  "nome": "Maria Souza Atualizada",
  "telefone": "11988887777",
  "email": "maria.atualizada@email.com",
  "cpf": "123.456.789-00",
  "endereco": "Rua Nova, 456"
}
```

## 7. Excluir Cliente

Troque o `1` pelo ID real do cliente.

```txt
DELETE http://localhost:3000/api/clientes/1
```

## 8. Cadastrar Pet

Use um `cliente_id` existente.

```txt
POST http://localhost:3000/api/pets
```

Body:

```json
{
  "nome": "Thor",
  "especie": "Cachorro",
  "raca": "Labrador",
  "cliente_id": 1
}
```

Resposta esperada:

```json
{
  "message": "Pet cadastrado com sucesso!",
  "id_pet": 1
}
```

## 9. Listar Pets

```txt
GET http://localhost:3000/api/pets
```

Com filtros:

```txt
GET http://localhost:3000/api/pets?busca=thor&page=1&limit=5
GET http://localhost:3000/api/pets?cliente_id=1&especie=Cachorro
```

## 10. Atualizar Pet

Troque o `1` pelo ID real do pet.

```txt
PUT http://localhost:3000/api/pets/1
```

Body:

```json
{
  "nome": "Thor Atualizado",
  "especie": "Cachorro",
  "raca": "Golden",
  "cliente_id": 1
}
```

## 11. Excluir Pet

Troque o `1` pelo ID real do pet.

```txt
DELETE http://localhost:3000/api/pets/1
```

## 12. Cadastrar Agendamento

Use um `pet_id` existente.

```txt
POST http://localhost:3000/api/agendamentos
```

Body:

```json
{
  "pet_id": 1,
  "servico": "Banho e Tosa",
  "data_servico": "2026-05-25",
  "horario_servico": "14:30:00",
  "status": "Agendado",
  "observacao": "Pet sensivel a barulho"
}
```

Resposta esperada:

```json
{
  "message": "Agendamento cadastrado com sucesso!",
  "id_agendamento": 1
}
```

## 13. Listar Agendamentos

```txt
GET http://localhost:3000/api/agendamentos
```

Com filtros:

```txt
GET http://localhost:3000/api/agendamentos?status=Agendado&page=1&limit=5
GET http://localhost:3000/api/agendamentos?data=2026-05-25
GET http://localhost:3000/api/agendamentos?busca=thor
```

## 14. Atualizar Agendamento

Troque o `1` pelo ID real do agendamento.

```txt
PUT http://localhost:3000/api/agendamentos/1
```

Body:

```json
{
  "pet_id": 1,
  "servico": "Tosa",
  "data_servico": "2026-05-26",
  "horario_servico": "15:00:00",
  "status": "Em Andamento",
  "observacao": "Atualizado pelo Postman"
}
```

## 15. Excluir Agendamento

Troque o `1` pelo ID real do agendamento.

```txt
DELETE http://localhost:3000/api/agendamentos/1
```

## Regras de Negocio

- Nao permite cadastrar pet com `cliente_id` inexistente
- Nao permite cadastrar agendamento com `pet_id` inexistente
- Nao permite agendamento em data passada
- Nao permite dois agendamentos ativos no mesmo dia e horario
- Valida status do agendamento
- Valida servicos permitidos
- Valida e-mail, CEP, horario e data
- Protege rotas privadas com JWT

Status permitidos:

```txt
Agendado
Em Andamento
Concluído
Cancelado
```

Servicos permitidos:

```txt
Banho
Tosa
Banho e Tosa
Outros
```
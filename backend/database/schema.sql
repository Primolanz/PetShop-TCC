DROP DATABASE IF EXISTS petshop_db;
CREATE DATABASE petshop_db;
USE petshop_db;

CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    cpf VARCHAR(14) UNIQUE,
    endereco VARCHAR(255)
);

CREATE TABLE pets (
    id_pet INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    especie VARCHAR(30) NOT NULL,
    raca VARCHAR(50),
    cliente_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id_cliente) ON DELETE CASCADE
);

CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT,
    servico ENUM('Banho', 'Tosa', 'Banho e Tosa', 'Outros') NOT NULL,
    data_servico DATE NOT NULL,
    horario_servico TIME NOT NULL,
    status ENUM('Agendado', 'Em Andamento', 'Concluído', 'Cancelado') DEFAULT 'Agendado',
    observacao TEXT,
    FOREIGN KEY (pet_id) REFERENCES pets(id_pet) ON DELETE CASCADE
);

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

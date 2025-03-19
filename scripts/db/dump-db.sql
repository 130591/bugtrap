DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'bugtrap') THEN
        CREATE DATABASE bugtrap;
    END IF;
END $$;

\c bugtrap;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Contas
CREATE TABLE IF NOT EXISTS Accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash CHAR(64) NOT NULL,
    portrait_image BYTEA,
    hourly_rate NUMERIC(9,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Status de Bugs
CREATE TABLE IF NOT EXISTS BugStatus (
  status VARCHAR(20) PRIMARY KEY
);

-- Tabela de Bugs
CREATE TABLE IF NOT EXISTS Bugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_reported DATE NOT NULL,
    summary VARCHAR(80) NOT NULL,
    description TEXT,
    resolution TEXT,
    reported_by UUID NOT NULL,
    assigned_to UUID,
    verified_by UUID,  
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(20),
    hours NUMERIC(9,2),
    FOREIGN KEY (reported_by) REFERENCES Accounts(id),
    FOREIGN KEY (assigned_to) REFERENCES Users(id),
    FOREIGN KEY (verified_by) REFERENCES Accounts(id),
    FOREIGN KEY (status) REFERENCES BugStatus(status),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash CHAR(64) NOT NULL,
    account_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

-- Tabela de Comentários
CREATE TABLE IF NOT EXISTS Comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), 
    bug_id UUID NOT NULL,
    author UUID NOT NULL, 
    comment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comment TEXT NOT NULL,
    FOREIGN KEY (bug_id) REFERENCES Bugs(id),
    FOREIGN KEY (author) REFERENCES Accounts(id)
);

-- Tabela de Capturas de Tela
CREATE TABLE IF NOT EXISTS Screenshots (
    bug_id UUID NOT NULL,
    image_id UUID NOT NULL DEFAULT uuid_generate_v4(),
    screenshot_image BYTEA, 
    caption VARCHAR(100),
    PRIMARY KEY (bug_id, image_id),
    FOREIGN KEY (bug_id) REFERENCES Bugs(id)
);

-- Tabela de Tags
CREATE TABLE IF NOT EXISTS Tags (
    bug_id UUID NOT NULL,
    tag VARCHAR(20) NOT NULL,
    PRIMARY KEY (bug_id, tag),
    FOREIGN KEY (bug_id) REFERENCES Bugs(id)
);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS Products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(50) NOT NULL
);

-- Tabela de Relação entre Bugs e Produtos
CREATE TABLE IF NOT EXISTS BugsProducts (
    bug_id UUID NOT NULL,
    product_id UUID NOT NULL,
    PRIMARY KEY (bug_id, product_id),
    FOREIGN KEY (bug_id) REFERENCES Bugs(id),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Tabela de Projetos
CREATE TABLE IF NOT EXISTS Projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_name VARCHAR(100) NOT NULL,
    description TEXT,
    owner_id UUID NOT NULL, 
    account_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id),
    FOREIGN KEY (account_id) REFERENCES Accounts(id)
);

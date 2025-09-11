-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas Bancárias
CREATE TYPE account_type AS ENUM ('checking', 'savings');

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    agency VARCHAR(10) NOT NULL,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type account_type NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Tabela de Transações
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_account
        FOREIGN KEY(account_id)
        REFERENCES accounts(id)
        ON DELETE RESTRICT -- Impede a exclusão de uma conta com transações
);

-- Tabela de Logs de Ações Críticas
CREATE TABLE action_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_log
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Índices para melhorar a performance das consultas
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_logs_user_id ON action_logs(user_id);
CREATE INDEX idx_logs_action ON action_logs(action);

-- Tabela de Chaves PIX
CREATE TYPE pix_key_type AS ENUM ('cpf', 'email', 'phone', 'random');
CREATE TYPE pix_key_status AS ENUM ('active', 'inactive');

CREATE TABLE pix_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    key_type pix_key_type NOT NULL,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    status pix_key_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_pix_key
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Índice para melhorar a performance das consultas de chaves PIX
CREATE INDEX idx_pix_keys_user_id ON pix_keys(user_id);
CREATE INDEX idx_pix_keys_key_value ON pix_keys(key_value);

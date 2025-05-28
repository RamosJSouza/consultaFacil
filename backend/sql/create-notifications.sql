-- Adicionar colunas para reset de senha na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP NULL;

-- Criar a tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Criar índice para melhorar a performance das consultas por usuário
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Inserir algumas notificações de teste (só executar se necessário)
-- Substitua o valor 1 pelo ID de um usuário existente em seu banco de dados
-- INSERT INTO notifications (user_id, message) VALUES 
--     (1, 'Bem-vindo ao ConsultaFácil! Seu cadastro foi concluído com sucesso.'),
--     (1, 'Você tem uma consulta agendada para amanhã às 14:00.'),
--     (1, 'Uma consulta foi cancelada pelo profissional.');

-- Comando para listar notificações de um usuário específico
-- SELECT * FROM notifications WHERE user_id = 1 ORDER BY created_at DESC;

-- Comando para marcar uma notificação como lida
-- UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = 1;

-- Comando para deletar todas as notificações de um usuário
-- DELETE FROM notifications WHERE user_id = 1; 
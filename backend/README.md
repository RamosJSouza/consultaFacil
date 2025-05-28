# ConsultaFácil - Backend

Backend do sistema ConsultaFácil, uma plataforma para agendamento de consultas entre clientes e profissionais.

## Tecnologias

- Node.js
- Express
- TypeScript
- Sequelize (PostgreSQL)
- JWT para autenticação

## Configuração do Ambiente

1. Instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto baseado no arquivo `.env.example`.

3. Configure o banco de dados PostgreSQL com as credenciais indicadas no seu arquivo `.env`.

## Banco de Dados

### Migrações

Para criar/atualizar as tabelas do banco de dados:

```bash
npm run migrate
```

As migrações incluem:
- Criação da coluna `updated_at` na tabela `users`
- Adição dos campos `reset_token` e `reset_token_expiry` na tabela `users`
- Criação da tabela `notifications`

### Seed de Dados

Para popular o banco de dados com dados de teste para notificações:

```bash
npm run seed:notifications
```

Este comando irá:
1. Criar notificações de teste para usuários existentes
2. Se não houver usuários, criar um usuário de teste para testar notificações

## Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

### Desenvolvimento com Reload Automático

```bash
npm run dev:watch
```

### Produção

```bash
npm run build
npm start
```

## Documentação da API

A documentação da API está disponível em:

```
http://localhost:3000/api-docs
```

## Recursos Principais

### Autenticação
- Login
- Registro
- Recuperação de senha

### Usuários
- Gerenciamento de usuários (clientes, profissionais, administradores)

### Agendamentos
- Criação, edição e cancelamento de consultas
- Visualização de agendamentos

### Notificações
- Sistema de notificações em tempo real
- Notificações não lidas, marcação como lidas
- Limpeza de notificações

## Estrutura do Projeto

- `src/controllers/`: Controladores da aplicação
- `src/models/`: Modelos do banco de dados
- `src/routes/`: Rotas da API
- `src/middleware/`: Middlewares (autenticação, validação, etc.)
- `src/services/`: Camada de serviços
- `src/repositories/`: Camada de acesso a dados
- `src/migrations/`: Scripts de migração do banco de dados
- `src/scripts/`: Scripts utilitários (migrações, seeds, etc.)
- `src/utils/`: Funções utilitárias
- `src/types/`: Definições de tipos TypeScript 
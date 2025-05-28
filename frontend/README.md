# ConsultaFácil Frontend

Interface de usuário da plataforma ConsultaFácil, um sistema de agendamento de consultas que permite clientes e profissionais gerenciarem seus compromissos de forma eficiente.

## Tecnologias

- React 18
- TypeScript
- React Router para navegação
- Tailwind CSS para estilização
- FullCalendar para visualização de agenda
- Axios para requisições HTTP
- Jest e Testing Library para testes

## Arquitetura

O projeto segue os princípios da Clean Architecture, separando as responsabilidades em camadas:

- **Domain**: Entidades e regras de negócio centrais
- **Application**: Casos de uso e lógica da aplicação
- **Infrastructure**: Implementações técnicas (API, armazenamento)
- **Presentation**: Componentes de UI, páginas e contextos

## Estrutura do Projeto

```
frontend/
├── public/                # Arquivos estáticos
├── src/
│   ├── domain/            # Entidades e interfaces de domínio
│   │   └── entities/      # Definições de entidades
│   ├── application/       # Casos de uso da aplicação
│   │   └── useCases/      # Implementação dos casos de uso
│   ├── infrastructure/    # Implementações técnicas
│   │   ├── services/      # Serviços de comunicação com API
│   │   └── config/        # Configurações da aplicação
│   ├── presentation/      # Interface do usuário
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── contexts/      # Contextos React
│   │   ├── hooks/         # Custom hooks
│   │   └── pages/         # Páginas da aplicação
│   ├── tests/             # Testes automatizados
│   └── App.tsx            # Componente principal
└── package.json
```

## Requisitos

- Node.js 14+
- npm 7+ ou yarn 1.22+

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Copie o arquivo `.env.example` para `.env.local` e configure as variáveis:
   ```
   cp .env.example .env.local
   ```

## Executando a aplicação

```
# Ambiente de desenvolvimento
npm start

# Build para produção
npm run build
```

## Testes

```
# Executa todos os testes
npm test

# Executa testes com watch mode
npm run test:watch

# Executa testes com cobertura
npm run test:coverage
```

## Funcionalidades

### Todos os usuários

- Login e registro
- Visualização e edição de perfil
- Sistema de notificações

### Clientes

- Visualização de dashboard com estatísticas
- Agendamento de consultas
- Visualização e gerenciamento de agendamentos
- Busca de profissionais

### Profissionais

- Dashboard com agenda do dia
- Gerenciamento de disponibilidade
- Confirmação/cancelamento de agendamentos
- Visualização de histórico de clientes

### Administradores

- Gerenciamento de usuários
- Estatísticas do sistema
- Configuração de regras de agendamento

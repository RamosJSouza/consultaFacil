# ConsultaFácil

PROJETO EM DESENVOLVIMENTO PARA PORTIFOLIO.
CONTINUE ACOMPANHANDO AQUI. 

A full-stack appointment scheduling system built with TypeScript, Node.js, React, and PostgreSQL.

## Features

- User authentication with role-based access (Client, Professional, Superadmin)
- Interactive calendar for appointment management
- Professional-client linking system
- Real-time appointment status updates
- Responsive design with Tailwind CSS
- API documentation with Swagger

## Prerequisites

- Node.js v18.x or higher
- PostgreSQL v16.x
- npm v9.x or higher

## Setup

1. Clone the repository
2. Set up the database:
   ```bash
   psql -U postgres -f backend/database.sql
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the values according to your environment

4. Install dependencies and start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

5. Install dependencies and start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Documentation

Access the Swagger documentation at `http://localhost:3000/api-docs` when the backend is running.

## Project Structure

```
backend/
├── src/
│   ├── config/       # Database and app configuration
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── types/        # TypeScript type definitions
frontend/
├── src/
│   ├── components/   # Reusable React components
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Page components
│   ├── services/     # API service layer
│   └── types/        # TypeScript type definitions
```

## Scripts

Backend:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

Frontend:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm preview` - Preview production build

## License

MIT

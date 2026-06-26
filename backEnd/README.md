# Lead Management Backend

A Node.js + Express + TypeScript backend for a lead management application with PostgreSQL, Prisma, JWT auth, lead CRUD, dashboard stats, search/filtering, validation, and Swagger docs.

## Tech Stack
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- Swagger

## Setup
1. Install dependencies:
   npm install
2. Create a PostgreSQL database and update the DATABASE_URL value in .env.
3. Run Prisma migrations:
   npx prisma migrate dev --name init
4. Start the server:
   npm run dev

## API
- Health: GET /health
- Auth: POST /api/auth/register, POST /api/auth/login
- Leads: GET /api/leads, POST /api/leads, GET /api/leads/:id, PUT /api/leads/:id, DELETE /api/leads/:id
- Dashboard: GET /api/leads/dashboard
- Swagger: /api/docs

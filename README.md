# Lead Management App

A full-stack lead management application built with React + TypeScript on the frontend and Node.js + Express + Prisma on the backend.

## Overview
This project is a production-style MVP for managing leads, including authentication, lead CRUD operations, dashboard statistics, and API documentation.

## Features
- User registration and login
- Forgot password and password reset flow
- Protected routes for authenticated users
- Create, edit, delete, search, and filter leads
- Dashboard summary statistics
- Swagger-based API documentation

## Project Structure
- [backEnd](backEnd) — Express, Prisma, PostgreSQL, JWT auth, Swagger
- [frontEnd](frontEnd) — React, Vite, TypeScript, React Router
- [docs](docs) — Database schema and Postman collection

## 1. Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Backend setup
1. Open the backend folder:
   ```bash
   cd backEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a PostgreSQL database and add a .env file with:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lead_management"
   JWT_SECRET="change-this-secret"
   PORT=3000
   ```
4. Apply Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend:
   ```bash
   npm run dev
   ```

Backend endpoints:
- Health: http://localhost:3000/health
- Swagger docs: http://localhost:3000/api/docs

### Frontend setup
1. Open the frontend folder:
   ```bash
   cd frontEnd
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Optional environment file for a custom API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

Frontend URL:
- http://localhost:5173

## 2. Database Schema
The database schema is defined in [backEnd/prisma/schema.prisma](backEnd/prisma/schema.prisma) and documented in [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md).

### Main models
- User
- Lead

### Relationships
- One User has many Leads
- Each Lead belongs to one User
- Deleting a User cascades to that user's leads

## 3. API Documentation
Two documentation options are included:
- Swagger UI: http://localhost:3000/api/docs
- Postman collection: [docs/LeadManagement.postman_collection.json](docs/LeadManagement.postman_collection.json)

### Main API endpoints
- Auth
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/forgot-password
  - POST /api/auth/reset-password
- Leads
  - GET /api/leads
  - POST /api/leads
  - GET /api/leads/:id
  - PUT /api/leads/:id
  - DELETE /api/leads/:id
  - GET /api/leads/dashboard

## 4. Build and Run

Backend:
```bash
cd backEnd
npm run build
```

Frontend:
```bash
cd frontEnd
npm run build
```

## 5. Notes for Developers
- If Prisma generation causes issues on Windows, rerun:
  ```bash
  cd backEnd
  npx prisma generate
  ```
- If the backend port is already in use, update the PORT value in the backend .env file.
- The app expects the frontend to talk to the backend at the URL set in VITE_API_URL.

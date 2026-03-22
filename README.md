<div align="center">
  
# 🚀 Limat Dep

**A full-stack, modern enterprise application combining a Next.js (React) front-end with a NestJS and PostgreSQL back-end.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>---

## ✨ Overview

Limat Dep is a comprehensive, scalable full-stack application built for high performance and strict type safety. It leverages a modern ecosystem:

- **Client:** A reactive front-end interface built with React 19, Next.js, and styled exclusively with modern Tailwind CSS v4.
- **Server:** A robust RESTful back-end API powered by NestJS 11, fully equipped with comprehensive validation, JWT authentication, and a flexible architecture.
- **Database:** PostgreSQL integration via Prisma ORM for type-safe database access, schema migrations, and relational data management.

## 🛠️ Tech Stack 

### Front-end (`/client`)
- **Framework & UI:** Next.js (v16/App Router), React 19, Tailwind CSS v4
- **State & Routing:** Next.js App Router, React Context
- **Icons & Assets:** Lucide React
- **Language:** TypeScript 5+

### Back-end (`/server`)
- **Framework:** NestJS 11
- **Database ORM:** Prisma Client & Prisma Adapter for PostgreSQL
- **Database Engine:** PostgreSQL
- **Security:** Passport Strategy, bcrypt, JWT, class-validator
- **Testing:** Jest, Supertest

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js** (v18.x or v20.x+)
- **npm** or **yarn**
- **PostgreSQL** server running locally or via Docker

### 1. Repository Setup

Clone the repository and enter the main directory:

```bash
git clone <repository-url>
cd limat-dep
```

### 2. Back-end Setup (`/server`)

The server component orchestrates database connections, authentication, and core business models.

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
# Copy .env.example to .env and configure your DATABASE_URL
cp .env.example .env

# Run Prisma schema tracking and migrations
npx prisma generate
npx prisma migrate dev

# Seed database with initial Admin credentials
npm run prisma:seed

# Start the development server (runs on default port, typically 3000/3001)
npm run start:dev
```

### 3. Front-end Setup (`/client`)

The client application drives the user experience, interfacing heavily with the API endpoints.

```bash
# Open a new terminal session
cd client

# Install dependencies
npm install

# Modify .env for local client vars if needed
cp .env.example .env

# Run the development server
npm run dev
```

Your React application will likely be accessible at `http://localhost:3000` or the port allocated by Next.js.

## 🗂️ Project Structure

```bash
limat-dep/
├── client/                     # Next.js Frontend App
│   ├── app/                    # Next.js App Router Pages
│   ├── components/             # Reusable UI React Components
│   ├── context/                # Global React Contexts
│   ├── hooks/                  # Custom React Hooks
│   ├── lib/                    # Shared Libraries and Utility Functions
│   └── public/                 # Static Assets
├── server/                     # NestJS Backend API
│   ├── src/                    # Core Server Modules, Controllers & Services
│   ├── prisma/                 # Prisma Schema and Seeds
│   └── test/                   # End-To-End (E2E) Test Files
└── README.md                   # Project Documentation
```

## 🤝 Contributing

Contributions are what make the open source and development community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information (if applicable).

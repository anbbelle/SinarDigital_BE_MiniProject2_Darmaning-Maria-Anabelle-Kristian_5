# Product Management System

Backend application with Prisma ORM, CRUD operations, and file upload.

## Installation

npm install

## Setup

1. Copy .env.example to .env
2. Edit .env with your database credentials
3. Run migrations: npx prisma migrate dev --name init
4. Seed database: npm run seed

## Run

npm run dev

Open: http://localhost:3000

## Features

- CRUD Products with image upload
- CRUD Categories
- Relationship: Category → Products (1-to-many)
- Pagination & Search
- 20+ seeded data

## Tech Stack

- Node.js + Express.js
- Prisma ORM + MySQL
- Multer (file upload)
- EJS (template engine)
Xeno CRM – Shopify Customer Relationship Manager

Xeno CRM is a full-stack platform built for Shopify merchants to manage customer data, segment audiences, sync Shopify orders, and run campaigns — all in one place.

🚀 Features

Shopify Webhook Integration (Orders, Customers)

Tenant-based Multi-Store Architecture

Real-time Customer Syncing

Audience Segmentation

Campaign Creation & Targeting

Secure Authentication (JWT)

Role-based Access Control

Full Admin Dashboard

🏗️ Architecture Overview
graph TD
    A[Shopify Store] -->|Webhooks| B(Backend API)
    B --> C[(PostgreSQL Database)]
    B --> D[(Redis Cache)]
    E[Admin Dashboard - React] --> B
    B --> F[Background Workers]

🛠️ Tech Stack
Backend

Node.js

Express.js

PostgreSQL (via Prisma ORM)

Redis (Caching)

Shopify Admin API

JWT Authentication

Frontend

React.js

TailwindCSS

Recharts (Analytics)

🔄 Shopify Sync Flow
sequenceDiagram
    participant Shopify
    participant Backend
    participant DB
    Shopify->>Backend: Order/Create Webhook
    Backend->>DB: Insert/Update Customer & Order
    Backend-->>Shopify: 200 OK

🏬 Multi-Tenant Database Model
erDiagram
    Tenant ||--o{ Customer : has
    Tenant ||--o{ Order : has  
    Customer ||--o{ Order : places  

    Tenant {
        string id PK
        string shopDomain
        string accessToken
    }

    Customer {
        string id PK
        string tenantId FK
        string email
        float totalSpent
        int ordersCount
    }

    Order {
        string id PK
        string customerId FK
        string tenantId FK
        float amount
        date createdAt
    }

📡 API Endpoints (Backend)
flowchart TD
    A[/Client/] --> B{Auth}
    B -->|Login| C[POST /auth/login]
    B -->|Signup| D[POST /auth/signup]

    A --> E{Customers}
    E --> F[GET /customers]
    E --> G[GET /customers/:id]

    A --> H{Orders}
    H --> I[GET /orders]
    H --> J[GET /orders/:id]

    A --> K{Webhooks}
    K --> L[POST /webhook/order-create]
    K --> M[POST /webhook/customer-create]

📁 Project Structure
xeno_project/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── prisma/
│   └── server.js
│
└── frontend/
    ├── src/
    ├── components/
    ├── pages/
    └── App.jsx

⚙️ Environment Variables

Create a .env file in /backend:

DATABASE_URL=postgres://...
REDIS_URL=redis://...
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
JWT_SECRET=...

🧪 Running The Project
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm start

📬 Webhook Endpoints (Shopify)
Event	Endpoint
Order Create	/webhook/order-create
Customer Create	/webhook/customer-create
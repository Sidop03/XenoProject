XENO CRM – Shopify Customer Relationship Management Platform

Xeno CRM is a full-stack CRM platform built for Shopify merchants to analyze customer behavior, create dynamic audience segments, and send SMS/Email campaigns.
It is optimized for scalability, real-time sync, and multi-tenant architecture.

📚 Table of Contents

Features

Architecture

Shopify Integration

Campaign Workflow

Authentication Flow

Database Schema

Tech Stack

Project Structure

Future Enhancements

Setup Instructions

⭐ Features

🔒 Authentication (JWT)

Access & Refresh Token mechanism

Auto-refresh using interceptors

Logout + token invalidation

Protected backend routes

Role-based support (extensible)

👥 Customer Management

Fetch & sync customers from Shopify

Auto-update total spent & order count

Fast search, pagination, filters

Multi-tenant isolation via tenantId

🎯 Audience Segmentation

Condition builder UI

Dynamic segment rule engine

Auto-recalculation after customer update

Supports multiple operators: >, <, contains, =, etc.

📣 Campaign Management

SMS / Email campaigns

Redis + BullMQ job scheduling

Delivery tracking: delivered / failed / pending

Can integrate with Twilio / SendGrid / AWS SES

🛍️ Shopify Integration

Webhooks:

orders/create

customers/create

customers/update

Automatic tenant creation

Per-store data isolation

🏗️ System Architecture
flowchart TB

subgraph Frontend
A[React + Vite + Tailwind] --> B[JWT Auth Flow]
end

subgraph Backend
C[Express.js API] --> D[Auth Service]
C --> E[Customer Service]
C --> F[Segment Service]
C --> G[Campaign Service]
end

subgraph DB
H[(PostgreSQL)]
end

subgraph Cache
I[(Redis)]
J[BullMQ Queue]
end

A --> C
D --> H
E --> H
F --> H
G --> H
G --> J
E --> I

🛍️ Shopify Webhook Flow
sequenceDiagram
    participant Shopify
    participant Server
    participant CustomerService
    participant DB

    Shopify->>Server: POST /webhook/orders/create
    Server->>CustomerService: Process order
    CustomerService->>DB: Update totalSpent & ordersCount
    DB-->>CustomerService: Acknowledgement
    CustomerService-->>Server: 200 OK
    Server-->>Shopify: 200 OK

📣 Campaign Flow
flowchart LR
A[Create Campaign] --> B[Store in PostgreSQL]
B --> C[Push job to BullMQ Queue]
C --> D[Worker Processes Job]
D --> E[Send SMS/Email via Provider]
E --> F[Update Status (Delivered/Failed)]
F --> B

🔐 Authentication Sequence Diagram
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant DB

    User->>Frontend: Submit login form
    Frontend->>Backend: POST /auth/login
    Backend->>DB: Validate credentials
    DB-->>Backend: User found
    Backend-->>Frontend: Access + Refresh Token
    Frontend->>Frontend: Save tokens in storage

🗄️ ER Diagram (Database Schema)
erDiagram
    CUSTOMER {
        string id PK
        string tenantId FK
        string email
        string firstName
        string lastName
        string phone
        float totalSpent
        int ordersCount
        datetime createdAt
    }

    SEGMENT {
        string id PK
        string tenantId FK
        string name
        json rules
        datetime createdAt
    }

    CAMPAIGN {
        string id PK
        string tenantId FK
        string segmentId FK
        string title
        string content
        string channel
        string status
        datetime createdAt
    }

    TENANT {
        string id PK
        string shopDomain
        datetime createdAt
    }

    TENANT ||--o{ CUSTOMER : owns
    TENANT ||--o{ SEGMENT : owns
    TENANT ||--o{ CAMPAIGN : owns
    SEGMENT ||--o{ CAMPAIGN : targets

🧰 Tech Stack
Frontend

React.js

Vite

Tailwind CSS

Axios + Interceptors

Context API

Backend

Node.js

Express.js

Prisma ORM

PostgreSQL

Redis (Cache + Queues)

BullMQ

Deployment

Render / Railway / Vercel

Webhook validator (HMAC)

Production logs (pino/winston)

📂 Project Structure
xeno-crm/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── jobs/
│   │   ├── prisma/
│   ├── index.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── api/
│   └── vite.config.js

🔮 Future Enhancements

Shopify App Bridge

AI-based customer scoring

Recommendation engine

Cohort analytics

Multi-store parent dashboards

Drag-and-drop email builder

A/B testing for campaigns

⚙️ Setup
git clone https://github.com/yourusername/xeno-crm.git
cd backend
npm install
npx prisma migrate dev
npm run dev

cd ../frontend
npm install
npm run dev
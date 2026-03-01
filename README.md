# GAO CRM

<p align="center">
  <img src="https://img.shields.io/badge/GAO_CRM-v1.0.0-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiLz48cGF0aCBkPSJNMyA5aDE4Ii8+PHBhdGggZD0iTTkgMjFWOSIvPjwvc3ZnPg==&logoColor=white" alt="GAO CRM" />
  <img src="https://img.shields.io/badge/TypeScript-5.9+-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</p>

<p align="center">
  A comprehensive, full-featured <strong>Customer Relationship Management</strong> platform built with the <a href="https://github.com/nicepkg/gao">GAO Framework</a>.<br/>
  Manage contacts, companies, deals, invoices, quotations, projects, campaigns, and more — all from a modern, glassmorphism-inspired admin dashboard.
</p>

---

## ✨ Features

### 🏢 CRM Core
- **📊 Dashboard** — Real-time KPIs, sales pipeline visualization, revenue metrics, win rate, and activity feed
- **👥 Contacts** — Full contact management with status lifecycle (Lead → Prospect → Customer → Churned), search, and company linking
- **🏢 Companies** — Company profiles with related contacts, deals, employee count, and revenue tracking
- **💰 Pipeline** — Visual deal pipeline (Lead → Qualified → Proposal → Negotiation → Won/Lost) with drag-and-drop stages
- **📋 Activities** — Log calls, meetings, emails, and tasks linked to contacts and deals

### 💼 Sales & Finance
- **📝 Quotations** — Create, send, and track quotations with line items, discounts, and tax calculation
- **🧾 Invoices** — Invoice generation with status management (Draft → Pending → Sent → Paid), recurring invoices (monthly), prorate support, and payment recording
- **📦 Products** — Product catalog with SKU, pricing, and inventory tracking
- **💲 Price Lists** — Tiered and custom pricing per customer segment

### 📣 Marketing
- **📧 Email Hub** — Email templates, tracking, and link click analytics
- **📢 Campaigns** — Multi-channel campaign management with recipient tracking
- **📝 Forms** — Drag-and-drop form builder with field customization and submission tracking
- **🌐 Landing Pages** — Template-based landing page builder (Product Showcase, Lead Capture, Event Registration, Quiz + Leaderboard, Survey Form, and more)
- **🔍 Web Tracking** — Visitor tracking and behavior analytics

### 🛠️ Operations
- **📂 Projects** — Project management with task boards, status workflows, and team assignment
- **📅 Calendar** — Event management with attendees and reminders
- **🎫 Tickets** — Support ticketing system with CSAT surveys
- **💬 Live Chat** — Real-time customer messaging
- **📢 Announcements** — Internal team announcements
- **📚 Knowledge Base** — Article management for self-service support

### ⚙️ Administration
- **🤖 AI Insights** — AI-powered analytics and conversation intelligence
- **📊 Reports** — Win/loss analysis, revenue reports, and performance dashboards
- **🔒 Audit Log** — Complete audit trail for security and compliance
- **⚙️ Settings** — System configuration, user management, and preferences
- **🔗 Plugins** — Extensible plugin architecture
- **🔄 Automations** — Workflow automation with custom triggers and actions
- **✅ Approvals** — Multi-level approval chains for quotations, deals, and invoices

### Technical Highlights
- **🔐 JWT Authentication** with Argon2 password hashing
- **🛡️ RBAC** — Role-based access control (Admin, Sales Manager, Sales Rep)
- **🗄️ Active Record ORM** — Type-safe database access with 70+ models and soft delete
- **🎨 Server-Side Rendered** — Fast, glassmorphism dark theme admin UI
- **📄 RESTful API** — Full JSON API for all entities with standard envelope format
- **🔄 Recurring Invoices** — Monthly auto-billing with configurable billing day
- **📊 Prorate Calculation** — Mid-month subscription adjustment

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | 22+     |
| pnpm        | 9+      |
| PostgreSQL  | 15+     |

### 1. Clone & Install

```bash
git clone <repository-url>
cd gao-framework

# Install all workspace dependencies
pnpm install
```

### 2. Create Database

```sql
CREATE DATABASE your_database_name;
```

### 3. Configure Environment

Database configuration is in `gao-crm/gao.config.ts`. Update the credentials as needed:

```typescript
database: {
    driver: 'postgres',
    host: 'localhost',
    port: 5432,
    database: '********',
    user: '********',
    password: process.env.DB_PASSWORD ?? '********',
}
```

You can override the password via environment variable:

```bash
export DB_PASSWORD=your_password
```

### 4. Run Migrations

```bash
cd gao-crm
pnpm migrate
```

### 5. Seed Sample Data

```bash
pnpm seed
```

This creates sample data including users, companies, contacts, deals, activities, tags, products, quotations, invoices, and more for a complete demo environment.

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Login

Use the credentials created by the seeder. Default accounts are available for Admin, Sales Manager, and Sales Rep roles.

> ⚠️ **Important:** Change all default passwords before deploying to production.

---

## 📁 Project Structure

```
gao-crm/
├── gao.config.ts                    # App + database configuration
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
└── src/
    ├── app.ts                       # Main entry point & server bootstrap
    │
    ├── controllers/                 # Route handlers (31 controllers)
    │   ├── auth.controller.ts       # Login/logout pages
    │   ├── dashboard.controller.ts  # Dashboard with KPIs
    │   ├── contact.controller.ts    # Contact CRUD
    │   ├── company.controller.ts    # Company CRUD
    │   ├── pipeline.controller.ts   # Deal pipeline visualization
    │   ├── deal.controller.ts       # Deal management
    │   ├── product.controller.ts    # Product catalog
    │   ├── quotation.controller.ts  # Quotation management
    │   ├── invoice.controller.ts    # Invoice management (recurring, prorate)
    │   ├── project.controller.ts    # Project management
    │   ├── calendar.controller.ts   # Calendar events
    │   ├── email-hub.controller.ts  # Email management
    │   ├── campaign.controller.ts   # Campaign management
    │   ├── form.controller.ts       # Form builder
    │   ├── landing-page.controller.ts # Landing page builder
    │   ├── ticket.controller.ts     # Support tickets
    │   ├── live-chat.controller.ts  # Live chat
    │   ├── report.controller.ts     # Reports & analytics
    │   └── api/                     # JSON API endpoints
    │
    ├── models/                      # Active Record models (70+ models)
    ├── services/                    # Business logic layer
    ├── middleware/                   # Auth, RBAC, rate limiting
    ├── migrations/                  # Database migrations (001-074)
    ├── helpers/                     # Utility functions (escape, format, pagination)
    ├── views/                       # Admin template renderer
    ├── migrate.ts                   # Migration runner script
    └── seed.ts                      # Database seeder
```

---

## 🗄️ Database Schema

The application uses **74 migration files** creating a comprehensive schema. Key table groups:

### Core CRM
| Table | Description |
|-------|-------------|
| `users` | Application users with roles (admin, sales_manager, sales_rep) |
| `companies` | Companies with industry, revenue, and employee data |
| `contacts` | Contacts linked to companies and assigned to users |
| `deal_stages` | Pipeline stages (Lead, Qualified, Proposal, Negotiation, Won, Lost) |
| `deals` | Business deals with value, probability, and stage tracking |
| `activities` | Logged interactions (call, meeting, email, task) |
| `notes` | Polymorphic notes on contacts and deals |
| `tags` | Color-coded labels for categorization |

### Sales & Finance
| Table | Description |
|-------|-------------|
| `products` | Product catalog with SKU, pricing, categories |
| `price_lists` / `price_list_items` | Custom pricing tiers |
| `quotations` / `quotation_items` | Quotation management with line items |
| `invoices` / `invoice_items` | Invoice management with recurring & prorate support |
| `payments` | Payment records linked to invoices |

### Marketing & Engagement
| Table | Description |
|-------|-------------|
| `email_templates` / `email_messages` | Email system with tracking |
| `campaigns` / `campaign_recipients` | Campaign management |
| `forms` / `form_fields` / `form_submissions` | Form builder data |
| `landing_pages` | Landing page templates |
| `tracking_events` / `tracking_sessions` | Web analytics |

### Operations & Support
| Table | Description |
|-------|-------------|
| `projects` / `project_tasks` | Project management |
| `calendar_events` | Calendar system |
| `tickets` | Support ticketing |
| `live_chat_sessions` / `live_chat_messages` | Real-time chat |
| `knowledge_base_articles` | Knowledge base |

All tables use **UUID primary keys**, **timestamp audit columns** (`created_at`, `updated_at`), and **soft delete** (`deleted_at`).

---

## 🔌 API Reference

All API endpoints are prefixed with `/api/` and require Bearer authentication unless noted otherwise.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | No | Login, returns JWT |
| `POST` | `/api/auth/logout` | Bearer | Logout |
| `GET` | `/api/auth/me` | Bearer | Current user info |

### CRM Resources

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Contacts** | `GET/POST/PUT/DELETE /api/contacts` | Contact CRUD with search & pagination |
| **Companies** | `GET/POST/PUT/DELETE /api/companies` | Company CRUD |
| **Deals** | `GET/POST/PUT/DELETE /api/deals` | Deal management with stage transitions |
| **Activities** | `GET/POST/PUT/DELETE /api/activities` | Activity logging |
| **Notes** | `GET/POST/PUT/DELETE /api/notes` | Polymorphic notes |
| **Tags** | `GET/POST/PUT/DELETE /api/tags` | Tag management |

### Sales & Finance

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Products** | `GET/POST/PUT/DELETE /api/products` | Product catalog |
| **Quotations** | `GET/POST/PUT/DELETE /api/quotations` | Quotation management |
| **Invoices** | `GET/POST/PATCH/DELETE /api/invoices` | Invoice management with payment recording |

### Other Resources

| Resource | Endpoints | Description |
|----------|-----------|-------------|
| **Projects** | `GET/POST/PUT/DELETE /api/projects` | Project management |
| **Calendar** | `GET/POST/PUT/DELETE /api/calendar-events` | Calendar events |
| **Forms** | `GET/POST/PUT/DELETE /api/forms` | Form builder |
| **Campaigns** | `GET/POST/PUT/DELETE /api/campaigns` | Campaign management |
| **Tickets** | `GET/POST/PUT/DELETE /api/tickets` | Support tickets |
| **Dashboard** | `GET /api/dashboard/stats` | Dashboard statistics |

### Response Format

All API responses follow the standard GAO envelope format:

```json
// Success
{
    "data": { ... },
    "meta": { "page": 1, "per_page": 15, "total": 42, "total_pages": 3 }
}

// Error
{
    "error": { "code": "VALIDATION", "message": "Validation failed" }
}
```

---

## 🔐 Security

| Area | Implementation |
|------|----------------|
| Password Hashing | **Argon2** via `@gao/security` |
| Authentication | **JWT** with configurable expiry |
| Authorization | **RBAC** (Admin, Sales Manager, Sales Rep) |
| Input Validation | Server-side on all API endpoints |
| SQL Injection | Parameterized queries via `@gao/orm` Query Builder |
| XSS Prevention | HTML escaping on all rendered output |
| Rate Limiting | Configurable via `gao.config.ts` |
| Audit Trail | Complete audit logging for all entity changes |
| Soft Delete | All data uses `deleted_at` — no hard deletes |

---

## 🛠️ Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev** | `pnpm dev` | Start dev server with hot reload (`tsx watch`) |
| **Start** | `pnpm start` | Start production server |
| **Build** | `pnpm build` | Compile TypeScript to JavaScript |
| **Migrate** | `pnpm migrate` | Run database migrations |
| **Migrate Fresh** | `pnpm migrate:fresh` | Drop all & re-run migrations |
| **Seed** | `pnpm seed` | Populate database with sample data |

---

## 🧰 Tech Stack

### Framework & Runtime
- [GAO Framework](https://github.com/nicepkg/gao) — TypeScript-first full-stack framework
- [Node.js 22+](https://nodejs.org/) — Runtime environment
- [TypeScript 5.9+](https://www.typescriptlang.org/) — Type-safe development

### Core Packages (GAO Workspace)

| Package | Purpose |
|---------|---------|
| `@gao/core` | Configuration & lifecycle management |
| `@gao/http` | HTTP server, routing, decorators (`@Controller`, `@Get`, `@Post`) |
| `@gao/orm` | Active Record ORM with Query Builder & migrations |
| `@gao/view` | Template engine |
| `@gao/ui` | Admin dashboard template (sidebar, navbar, cards, tables) |
| `@gao/security` | JWT, Argon2 hashing, RBAC, rate limiting, XSS guard |

### Database
- [PostgreSQL 15+](https://www.postgresql.org/) — Primary database
- [`pg` (node-postgres)](https://node-postgres.com/) — PostgreSQL driver

### Dev Tools
- [`tsx`](https://github.com/privatenumber/tsx) — Fast TypeScript execution
- [`pino-pretty`](https://github.com/pinojs/pino-pretty) — Pretty-printed development logs

---

## 🔧 Configuration

Application configuration is managed through `gao.config.ts`:

```typescript
import { defineConfig } from '@gao/core';

export default defineConfig({
    app: {
        name: 'GAO CRM',
        port: 3000,
        environment: 'development',
        debug: true,
    },
    database: {
        driver: 'postgres',
        host: 'localhost',
        port: 5432,
        database: '********',
        user: '********',
        password: process.env.DB_PASSWORD ?? '********',
    },
    security: {
        cors: { origin: '*' },
        rateLimit: { windowMs: 60_000, maxRequests: 100 },
    },
});
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | — | PostgreSQL password |
| `JWT_SECRET` | Auto-generated | Secret for JWT signing |

---

## 📝 License

This project is private and not licensed for distribution.

---

<p align="center">
  Built with ❤️ using <strong>GAO Framework</strong>
</p>

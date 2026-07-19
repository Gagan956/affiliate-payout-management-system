# 💸 Affiliate Payout Management System

A scalable backend application built with **Node.js**, **Express.js**, and **MongoDB** that automates affiliate payouts, sales reconciliation, withdrawal management, and payout recovery. The system follows a layered architecture and demonstrates clean backend engineering practices suitable for production-ready applications.

---

## 🚀 Features

* User Management
* Sale Management
* Automatic Advance Payout (10%)
* Final Payout after Sale Approval
* Sale Reconciliation (Approve / Reject)
* Withdrawal Management
* Failed Withdrawal Recovery
* Bulk Recovery Support
* Scheduled Advance Payout Processing (Cron Job)
* Request Validation
* Centralized Logging (Winston)
* RESTful API Design
* Layered Architecture (Controller → Service → Model)

---

## 🛠 Tech Stack

| Technology | Purpose                       |
| ---------- | ----------------------------- |
| Node.js    | JavaScript Runtime            |
| Express.js | REST API Framework            |
| MongoDB    | NoSQL Database                |
| Mongoose   | ODM                           |
| Winston    | Logging                       |
| node-cron  | Scheduled Jobs                |
| Helmet     | Security Middleware           |
| CORS       | Cross-Origin Resource Sharing |
| dotenv     | Environment Configuration     |

---

# 📁 Project Structure

```text
src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── logger.js            # Winston logger configuration
│
├── controllers/
│   ├── user.controller.js   # User CRUD operations
│   ├── sale.controller.js   # Sale management
│   ├── withdrawal.controller.js # Withdrawal operations
│   └── payout.controller.js # Payout operations
│
├── services/
│   ├── user.service.js      # User business logic
│   ├── sale.service.js      # Sale business logic
│   ├── advancePayout.service.js # Advance payout logic
│   ├── withdrawal.service.js # Withdrawal logic
│   ├── reconciliation.service.js # Reconciliation logic
│   └── recovery.service.js  # Recovery logic
│
├── routes/
│   ├── user.routes.js       # User endpoints
│   ├── sale.routes.js       # Sale endpoints
│   ├── withdrawal.routes.js # Withdrawal endpoints
│   └── payout.routes.js     # Payout endpoints
│
├── models/
│   ├── User.js              # User schema
│   ├── Sale.js              # Sale schema
│   ├── Withdrawal.js        # Withdrawal schema
│   └── Payout.js            # Payout schema
│
├── utils/
│   ├── helpers.js           # Utility functions
│   ├── validators.js        # Input validation
│   └── cron.js              # Cron job configuration
│
├── logs/                    # Application logs
│   ├── combined.log
│   └── error.log
│
├── docs/
│   ├── LLD.md              # Low-Level Design
│   ├── DATABASE.md         # Database schema
│   └── EDGE_CASES.md       # Edge cases
│
├── app.js                   # Express app configuration
└── server.js               # Server entry point
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Gagan956/affiliate-payout-management-system.git
cd affiliate-payout-management-system
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

ADVANCE_PAYOUT_PERCENTAGE=10

MIN_WITHDRAWAL_AMOUNT=10

WITHDRAWAL_COOLDOWN_HOURS=24
```

Start the server:

```bash
npm run dev
```

---

# 📌 API Overview

## User APIs

| Method | Endpoint          | Description   |
| ------ | ----------------- | ------------- |
| POST   | /api/users        | Create User   |
| GET    | /api/users        | Get All Users |
| GET    | /api/users/search | Search User   |

---

## Sale APIs

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | /api/sales               | Create Sale           |
| GET    | /api/sales               | Get All Sales         |
| GET    | /api/sales/:id           | Get Sale by ID        |
| PATCH  | /api/sales/:id/reconcile | Approve / Reject Sale |

---

## Payout APIs

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| POST   | /api/payouts/advance   | Process Advance Payout |
| GET    | /api/payouts/:userId   | Get User Payouts       |
| GET    | /api/payouts/debug/all | Debug Database         |

---

## Withdrawal APIs

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | /api/withdrawals              | Request Withdrawal       |
| PATCH  | /api/withdrawals/:id/complete | Complete Withdrawal      |
| PATCH  | /api/withdrawals/:id/fail     | Fail Withdrawal          |
| GET    | /api/withdrawals/:userId      | Get User Withdrawals     |
| POST   | /api/withdrawals/recover/bulk | Recover Multiple Payouts |

---

# 🔄 System Workflow

```text
Create User
      │
      ▼
Create Sale
      │
      ▼
Automatic Advance Payout (10%)
      │
      ▼
Pending Sale
      │
      ▼
Admin Reconciliation
 ┌───────────────┐
 │               │
 ▼               ▼
Approved     Rejected
 │               │
 ▼               ▼
Final Payout  Recover Advance
 │               │
 └───────┬───────┘
         ▼
 Update User Balance
         │
         ▼
 Request Withdrawal
         │
         ▼
 Withdrawal Pending
         │
 ┌───────┴────────┐
 ▼                ▼
Completed      Failed
 │                │
 ▼                ▼
Success      Recover Amount
```

---

# 🗄 Database Collections

* Users
* Sales
* Payouts
* Withdrawals

The relationships between these collections are documented in `docs/DATABASE.md`.

---

# 📖 Documentation

Detailed documentation is available in the `docs` directory.

* **API.md** – Complete API Documentation
* **ARCHITECTURE.md** – High-Level Architecture
* **LLD.md** – Low-Level Design
* **DATABASE.md** – Database Schema & Relationships
* **EDGE_CASES.md** – Failure Handling
* **DESIGN_DECISIONS.md** – Design Decisions & Trade-offs

---

# ✅ Assignment Coverage

This project includes:

* ✔ Low-Level Design (LLD)
* ✔ Database Schema with Relationships
* ✔ Layered Class/Module Design
* ✔ REST API Documentation
* ✔ Edge Case Handling
* ✔ JavaScript Implementation
* ✔ Design Decisions & Trade-offs
* ✔ Project Documentation



---

# 👨‍💻 Author

**Gagan Sharma**

Backend Developer | Node.js | Express.js | MongoDB

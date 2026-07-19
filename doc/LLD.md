# Low-Level Design (LLD)

## Architecture

The project follows a layered architecture to separate routing, request handling, business logic, and database access.

![LLD Diagram](images/lld-diagram.png)

## Layered Architecture

Client
↓
Routes
↓
Controllers
↓
Services
↓
Models
↓
MongoDB

---

## Modules

### Routes

Responsible for mapping HTTP requests to controllers.

- user.routes.js
- sale.routes.js
- payout.routes.js
- withdrawal.routes.js

---

### Controllers

Controllers handle incoming requests and responses.

Responsibilities

- Validate request
- Call service methods
- Return API response
- Handle errors

---

### Services

Contains complete business logic.

Services

- User Service
- Sale Service
- Payout Service
- Withdrawal Service

Responsibilities

- Calculate advance payout
- Final settlement
- Recovery
- Reconciliation
- Balance update

---

### Models

MongoDB collections

- User
- Sale
- Payout
- Withdrawal

---

### Utilities

- Logger
- Validation
- Error Handler
- Cron Jobs
- Constants
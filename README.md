# 💸 User Payout Management System

> A scalable backend system that automates advance payouts, final settlements, withdrawals, reconciliation, and recovery using Node.js, Express.js, MongoDB, and Mongoose.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Flow](#-project-flow)
- [Folder Structure](#-folder-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Low-Level Design](#-low-level-design)
- [Edge Cases & Failure Scenarios](#-edge-cases--failure-scenarios)
- [Key Design Decisions](#-key-design-decisions)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Monitoring & Logging](#-monitoring--logging)
- [Author](#-author)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 👤 **User Management** | Auto‑create users on sale creation with unique `userId` |
| 💰 **Sale Management** | Create and track sales with brand categorization |
| 🚀 **Advance Payout** | Automatic 10% advance payout on pending sales |
| ✅ **Final Settlement** | Complete payout on sale approval |
| 🏦 **Withdrawal Workflow** | Request, complete, or fail withdrawals with cooldown |
| 🔄 **Failed Recovery** | Automatic recovery of funds from failed withdrawals |
| ⚖️ **Reconciliation** | Approve/reject sales with adjustment handling |
| ⏰ **Cron Automation** | Scheduled job for pending advance payouts |
| 📊 **Logging** | Winston‑based logging with file rotation |
| 🛡️ **Validation** | Input validation with meaningful error messages |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **Winston** | Logging library |
| **Node‑Cron** | Scheduled jobs |
| **Helmet** | Security middleware |
| **CORS** | Cross‑origin resource sharing |
| **dotenv** | Environment variable management |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client (Postman/Web)                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Server                         │
│                    (Port: 3000)                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Routes Layer                            │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Users  │  │  Sales   │  │ Withdrawals │  │  Payouts   │  │
│  └─────────┘  └──────────┘  └────────────┘  └────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Controllers Layer                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Services Layer                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  • advancePayout.service   • reconciliation.service     │ │
│  │  • withdrawal.service      • recovery.service           │ │
│  │  • sale.service            • user.service               │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Models Layer                             │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │  User   │  │   Sale   │  │ Withdrawal │  │   Payout   │  │
│  └─────────┘  └──────────┘  └────────────┘  └────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                          │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌────────────┐  │
│  │  users  │  │  sales   │  │withdrawals │  │  payouts   │  │
│  └─────────┘  └──────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Project Flow

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
Reconciliation
┌──────────────┐
│              │
▼              ▼
Approved     Rejected
│              │
▼              ▼
Final Pay    Recover Advance
│
▼
Withdraw Balance
│
▼
Complete / Failed
│
▼
Recovery

---

## 📁 Folder Structure

```
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

## 📚 API Documentation

### 🔹 User Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **POST** | `/api/users` | Create new user | `{ "name": "John", "email": "john@example.com" }` | User object with generated `userId` |
| **GET** | `/api/users` | Get all users | - | List of all users |
| **GET** | `/api/users/search` | Search user | `?userId=...` or `?email=...` | Single user object |

### 🔹 Sale Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **POST** | `/api/sales` | Create sale | `{ "userId": "JA123456D", "brand": "brand_1", "earning": 1000 }` | Sale with auto-advance payout |
| **GET** | `/api/sales` | Get all sales | `?userId=...` or `?status=...` | List of sales |
| **GET** | `/api/sales/:id` | Get sale by ID | - | Single sale object |
| **PATCH** | `/api/sales/:id/reconcile` | Reconcile sale | `{ "status": "approved", "reconciledBy": "admin" }` | Updated sale with payouts |

### 🔹 Payout Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **POST** | `/api/payouts/advance` | Process advance payouts | `{ "userId": "JA123456D" }` | Processed payout results |
| **GET** | `/api/payouts/:userId` | Get user payouts | - | User payout history |
| **GET** | `/api/payouts/debug/all` | Debug database | - | All database records |

### 🔹 Withdrawal Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| **POST** | `/api/withdrawals` | Request withdrawal | `{ "userId": "JA123456D", "amount": 100 }` | Withdrawal request |
| **PATCH** | `/api/withdrawals/:id/complete` | Complete withdrawal | - | Withdrawal completed |
| **PATCH** | `/api/withdrawals/:id/fail` | Fail withdrawal | `{ "reason": "Insufficient funds" }` | Withdrawal failed |
| **GET** | `/api/withdrawals/:userId` | Get user withdrawals | - | User withdrawal history |
| **POST** | `/api/withdrawals/recover/bulk` | Bulk recovery | `{ "withdrawalIds": ["id1","id2"], "reason": "Bulk recovery" }` | Recovery results |

---

### 📝 API Usage Examples

#### 1. Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

Response (example):

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "userId": "JO123456E",
    "name": "John Doe",
    "email": "john@example.com",
    "withdrawableBalance": 0,
    "totalEarnings": 0,
    "totalAdvanceReceived": 0,
    "totalAdjustments": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Create Sale (Auto-Advance)

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "JO123456E",
    "brand": "brand_1",
    "earning": 1000
  }'
```

Response (example):

```json
{
  "success": true,
  "message": "✅ Sale created with advance payout",
  "sale": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "JO123456E",
    "brand": "brand_1",
    "earning": 1000,
    "status": "pending",
    "advancePaid": true,
    "advanceAmount": 100,
    "advancePayoutId": "507f1f77bcf86cd799439012"
  },
  "advance": {
    "success": true,
    "saleId": "507f1f77bcf86cd799439011",
    "advanceAmount": 100,
    "payoutId": "507f1f77bcf86cd799439012",
    "newBalance": 100
  }
}
```

#### 3. Reconcile Sale (Approve)

```bash
curl -X PATCH http://localhost:3000/api/sales/507f1f77bcf86cd799439011/reconcile \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "reconciledBy": "admin"
  }'
```

Response (example):

```json
{
  "success": true,
  "message": "Sale reconciled as approved",
  "sale": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "approved",
    "reconciledAt": "2024-01-15T10:35:00.000Z",
    "reconciledBy": "admin"
  },
  "finalPayoutAmount": 900,
  "adjustmentAmount": 0
}
```

#### 4. Request Withdrawal

```bash
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "JO123456E",
    "amount": 500
  }'
```

Response (example):

```json
{
  "success": true,
  "message": "Withdrawal request created successfully",
  "withdrawalId": "507f1f77bcf86cd799439013",
  "amount": 500,
  "balance": 500,
  "status": "pending"
}
```

#### 5. Complete Withdrawal

```bash
curl -X PATCH http://localhost:3000/api/withdrawals/507f1f77bcf86cd799439013/complete
```

Response (example):

```json
{
  "success": true,
  "message": "Withdrawal completed successfully",
  "withdrawalId": "507f1f77bcf86cd799439013"
}
```

#### 6. Fail & Recover Withdrawal

```bash
# Fail withdrawal
curl -X PATCH http://localhost:3000/api/withdrawals/507f1f77bcf86cd799439013/fail \
  -H "Content-Type: application/json" \
  -d '{ "reason": "Bank account invalid" }'

# Bulk recovery
curl -X POST http://localhost:3000/api/withdrawals/recover/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "withdrawalIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
    "reason": "Bank system error"
  }'
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    User     │      │    Sale     │      │   Payout    │
├─────────────┤      ├─────────────┤      ├─────────────┤
│ userId(PK)  │◄─────│ userId      │      │ userId      │
│ name        │      │ brand       │      │ amount      │
│ email       │      │ earning     │      │ type        │
│ balance     │      │ status      │      │ status      │
│ totalEarn   │      │ advancePaid │      │ saleIds     │
│ totalAdv    │      │ advanceAmt  │─────►│ withdrawalId│
│ totalAdj    │      │ advPayoutId │      │ description │
│ lastWithdr  │      │ reconciledAt│      └─────────────┘
└─────────────┘      │ reconciledBy│
                     └─────────────┘
                           │
                           │
                      ┌────▼─────┐
                      │Withdrawal│
                      ├──────────┤
                      │ userId   │
                      │ amount   │
                      │ status   │
                      │ payoutId │
                      │ failure  │
                      │ completed│
                      └──────────┘
```

### Collection Details

#### User Collection

```javascript
{
  userId: String (unique, index),
  name: String (required),
  email: String (unique, required),
  withdrawableBalance: Number (default: 0),
  totalEarnings: Number (default: 0),
  totalAdvanceReceived: Number (default: 0),
  totalAdjustments: Number (default: 0),
  lastWithdrawalAt: Date (default: null),
  createdAt: Date,
  updatedAt: Date
}
```

#### Sale Collection

```javascript
{
  userId: String (required, index),
  brand: String (enum: ['brand_1', 'brand_2', 'brand_3']),
  earning: Number (required, min: 0),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  advancePaid: Boolean (default: false),
  advanceAmount: Number (default: 0),
  advancePayoutId: ObjectId (ref: 'Payout'),
  reconciledAt: Date,
  reconciledBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payout Collection

```javascript
{
  userId: String (required, index),
  amount: Number (required),
  type: String (enum: ['advance', 'final', 'adjustment', 'recovered']),
  status: String (enum: ['pending', 'success', 'failed']),
  saleIds: [ObjectId] (ref: 'Sale'),
  withdrawalId: ObjectId (ref: 'Withdrawal'),
  description: String,
  failureReason: String,
  processedAt: Date,
  idempotencyKey: String (unique, sparse),
  createdAt: Date,
  updatedAt: Date
}
```

#### Withdrawal Collection

```javascript
{
  userId: String (required, index),
  amount: Number (required, min: 0),
  status: String (enum: ['pending', 'processing', 'completed', 'failed']),
  payoutId: ObjectId (ref: 'Payout'),
  failureReason: String,
  completedAt: Date,
  requestedAt: Date (default: Date.now),
  retryCount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

| Collection | Indexes | Purpose |
|------------|---------|---------|
| **User** | `{ userId: 1 }, { email: 1 }` | Fast lookups |
| **Sale** | `{ userId: 1 }, { userId: 1, status: 1 }, { status: 1, advancePaid: 1 }` | Efficient queries |
| **Payout** | `{ userId: 1, type: 1, status: 1 }, { status: 1, processedAt: 1 }` | Payout history |
| **Withdrawal** | `{ userId: 1, status: 1 }, { status: 1, requestedAt: 1 }` | Withdrawal queries |

---

## 📐 Low-Level Design

### Class Design (Service Layer)

#### Base Service Pattern

```javascript
class BaseService {
  async findOne(query) { 
    return this.model.findOne(query);
  }
  
  async findAll(query) { 
    return this.model.find(query);
  }
  
  async create(data) { 
    return this.model.create(data);
  }
  
  async update(query, data) { 
    return this.model.updateOne(query, data);
  }
}
```

#### User Service

```javascript
class UserService extends BaseService {
  async createUser(name, email) {
    const userId = await generateUniqueUserId(name, User);
    const user = new User({ userId, name, email });
    return user.save();
  }
  
  async getUserByUserId(userId) {
    return User.findOne({ userId });
  }
  
  async updateBalance(userId, amount) {
    return User.findOneAndUpdate(
      { userId },
      { $inc: { withdrawableBalance: amount } },
      { new: true }
    );
  }
}
```

#### Sale Service

```javascript
class SaleService extends BaseService {
  async createSale(userId, brand, earning) {
    // Auto-create user if not exists
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        name: userId,
        email: `${userId}@example.com`
      });
      await user.save();
    }

    const sale = new Sale({ userId, brand, earning });
    await sale.save();

    // Process advance payout automatically
    await processSaleAdvance(sale);
    
    return sale;
  }
}
```

#### Advance Payout Service

```javascript
class AdvancePayoutService {
  async processSaleAdvance(sale) {
    if (sale.status !== 'pending') return null;
    if (sale.advancePaid) return null;
    if (sale.earning <= 0) return null;

    const advanceAmount = calculatePercentage(
      sale.earning, 
      ADVANCE_PAYOUT_PERCENTAGE
    );

    const payout = new Payout({
      userId: sale.userId,
      amount: advanceAmount,
      type: 'advance',
      status: 'success',
      saleIds: [sale._id],
      processedAt: new Date()
    });
    await payout.save();

    sale.advancePaid = true;
    sale.advanceAmount = advanceAmount;
    sale.advancePayoutId = payout._id;
    await sale.save();

    await User.findOneAndUpdate(
      { userId: sale.userId },
      { 
        $inc: { 
          withdrawableBalance: advanceAmount,
          totalAdvanceReceived: advanceAmount 
        }
      }
    );

    return { success: true, advanceAmount, payoutId: payout._id };
  }
}
```

#### Withdrawal Service

```javascript
class WithdrawalService {
  async requestWithdrawal(userId, amount) {
    const user = await User.findOne({ userId });
    
    // Validate cooldown
    if (user.lastWithdrawalAt && isWithin24Hours(user.lastWithdrawalAt)) {
      throw new Error(`Cooldown: Please wait ${getHoursRemaining(user.lastWithdrawalAt)} hours`);
    }

    // Validate balance
    if (user.withdrawableBalance < amount) {
      throw new Error(`Insufficient balance. Available: ₹${user.withdrawableBalance}`);
    }

    // Create withdrawal
    const withdrawal = new Withdrawal({ userId, amount });
    await withdrawal.save();

    // Create payout
    const payout = new Payout({
      userId,
      amount,
      type: 'final',
      status: 'pending',
      withdrawalId: withdrawal._id
    });
    await payout.save();

    // Update user
    user.withdrawableBalance -= amount;
    user.lastWithdrawalAt = new Date();
    await user.save();

    return { success: true, withdrawalId: withdrawal._id };
  }
}
```

#### Reconciliation Service

```javascript
class ReconciliationService {
  async reconcileSale(saleId, newStatus, reconciledBy = 'admin') {
    const sale = await Sale.findById(saleId);
    
    if (sale.status !== 'pending') {
      throw new Error(`Sale already ${sale.status}. Cannot reconcile again.`);
    }

    sale.status = newStatus;
    sale.reconciledAt = new Date();
    sale.reconciledBy = reconciledBy;
    await sale.save();

    const user = await User.findOne({ userId: sale.userId });

    if (newStatus === 'approved') {
      const remainingAmount = sale.earning - (sale.advanceAmount || 0);
      
      if (remainingAmount > 0) {
        const payout = new Payout({
          userId: sale.userId,
          amount: remainingAmount,
          type: 'final',
          status: 'success',
          saleIds: [sale._id],
          processedAt: new Date()
        });
        await payout.save();
        user.withdrawableBalance += remainingAmount;
      }
      user.totalEarnings += sale.earning;
      await user.save();
    } 
    else if (newStatus === 'rejected' && sale.advancePaid) {
      const advanceAmount = sale.advanceAmount;
      
      const adjustment = new Payout({
        userId: sale.userId,
        amount: advanceAmount,
        type: 'adjustment',
        status: 'success',
        saleIds: [sale._id],
        processedAt: new Date()
      });
      await adjustment.save();

      user.withdrawableBalance = Math.max(0, user.withdrawableBalance - advanceAmount);
      user.totalAdjustments += advanceAmount;
      await user.save();
    }

    return { success: true, sale };
  }
}
```

#### Recovery Service

```javascript
class RecoveryService {
  async recoverFailedPayout(withdrawalId, reason) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (withdrawal.status === 'completed') {
      throw new Error('Cannot recover a completed withdrawal');
    }

    withdrawal.status = 'failed';
    withdrawal.failureReason = reason;
    await withdrawal.save();

    const payout = await Payout.findById(withdrawal.payoutId);
    if (payout) {
      payout.status = 'failed';
      payout.failureReason = reason;
      await payout.save();
    }

    const user = await User.findOne({ userId: withdrawal.userId });
    const recoveredAmount = withdrawal.amount;
    user.withdrawableBalance += recoveredAmount;
    await user.save();

    const recoveryPayout = new Payout({
      userId: withdrawal.userId,
      amount: recoveredAmount,
      type: 'recovered',
      status: 'success',
      withdrawalId: withdrawal._id,
      description: `Recovered from failed withdrawal #${withdrawalId}`,
      processedAt: new Date()
    });
    await recoveryPayout.save();

    return {
      success: true,
      withdrawalId: withdrawal._id,
      recoveredAmount,
      newBalance: user.withdrawableBalance
    };
  }
}
```

---

## ⚠️ Edge Cases & Failure Scenarios

1. User Management Edge Cases

| Scenario | Handling |
|---------|----------|
| Duplicate email | Returns 400 with existing user details |
| Missing name/email | Returns 400 with validation errors |
| User not found | Returns 404 with available users list |

2. Sale Management Edge Cases

| Scenario | Handling |
|---------|----------|
| Duplicate sale processing | Idempotency key prevents duplicate payouts |
| Sale already reconciled | Returns 400 with appropriate error message |
| Zero or negative earning | Skips advance payout with warning |
| User not found during sale | Auto-creates user with placeholder email |

3. Advance Payout Edge Cases

| Scenario | Handling |
|---------|----------|
| Zero earning | Skips advance payout |
| Already paid advance | Skips processing |
| Non-pending sale | Skips advance payout |
| Concurrent processing | Idempotency keys prevent duplicates |
| Sale not found | Logs error and continues with next |

4. Withdrawal Edge Cases

| Scenario | Handling |
|---------|----------|
| Insufficient balance | Returns 400 with available balance |
| Below minimum amount | Returns 400 with minimum required |
| Cooldown period active | Returns 429 with remaining hours |
| Withdrawal already completed | Returns 400 with clear error |
| Withdrawal not found | Returns 404 with helpful message |

5. Reconciliation Edge Cases

| Scenario | Handling |
|---------|----------|
| Approved sale - advance paid | Pays remaining amount only |
| Rejected sale - no advance | No adjustment made |
| Rejected sale - advance paid | Recover full advance amount |
| Insufficient balance for recovery | Recover only available amount |
| Sale already reconciled | Returns 400 with clear error |

6. Recovery Edge Cases

| Scenario | Handling |
|---------|----------|
| Withdrawal already completed | Cannot recover completed withdrawals |
| Withdrawal already failed | Prevent duplicate recovery |
| Multiple withdrawals recovery | Process each independently |
| User not found during recovery | Logs error and skips |
| Database transaction failures | Atomic operations ensure consistency |

7. Concurrent Processing

| Scenario | Prevention |
|---------|-----------|
| Duplicate advance payouts | Idempotency keys |
| Double withdrawal completion | Status checks |
| Race conditions | Mongoose atomic operations |
| Balance inconsistency | Database transactions |

---

## 🎯 Key Design Decisions

1. **Two-Phase Payout System**

- Decision: Separate advance (10%) and final payouts
- Why: Reduces financial risk for the platform while providing liquidity to users
- Trade-off: More complex workflow but better risk management

2. **User Auto-Creation**

- Decision: Auto-create users on sale creation
- Why: Simplifies onboarding and ensures data consistency
- Trade-off: Might create placeholder users without real email

3. **Idempotency Keys**

- Decision: Use unique keys for each payout transaction
- Why: Prevents duplicate payouts during retries or network failures
- Trade-off: Extra storage and validation overhead

4. **Withdrawal Cooldown**

- Decision: 24-hour cooldown between withdrawals
- Why: Prevents abuse and ensures transaction processing stability
- Trade-off: User inconvenience for platform security

5. **Cron-Based Automation**

- Decision: Process advance payouts every 30 minutes
- Why: Handles edge cases where real-time processing fails
- Trade-off: Slight delay in payout processing

6. **Rollback Mechanism**

- Decision: Failed withdrawals automatically recover funds
- Why: Maintains system integrity and user trust
- Trade-off: Requires additional recovery logic

7. **Separation of Concerns**

- Decision: Clear separation between controllers, services, and models
- Why: Improves maintainability, testability, and scalability
- Trade-off: More boilerplate code

8. **Validation Strategy**

- Decision: Validate at both API and service layers
- Why: Ensures data integrity and provides clear error messages
- Trade-off: Double validation overhead

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/payout-management-system.git
cd payout-management-system

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Update environment variables
# Edit .env with your MongoDB URI and other settings

# 5. Start MongoDB locally (or use MongoDB Atlas)
mongod --dbpath /path/to/data

# 6. Run the application
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

#### Docker Setup (Optional)

```bash
# Build Docker image
docker build -t payout-system .

# Run container
docker run -p 3000:3000 -e MONGODB_URI=mongodb://host.docker.internal:27017/payouts payout-system
```

---

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 3000 | No |
| MONGODB_URI | MongoDB connection string | - | Yes |
| ADVANCE_PAYOUT_PERCENTAGE | Percentage of earning for advance | 10 | No |
| MIN_WITHDRAWAL_AMOUNT | Minimum withdrawal amount | 10 | No |
| WITHDRAWAL_COOLDOWN_HOURS | Cooldown between withdrawals | 24 | No |
| NODE_ENV | Environment (development/production) | development | No |
| LOG_LEVEL | Logging level | info | No |

### Example .env File

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/payout_system
ADVANCE_PAYOUT_PERCENTAGE=10
MIN_WITHDRAWAL_AMOUNT=10
WITHDRAWAL_COOLDOWN_HOURS=24
NODE_ENV=development
LOG_LEVEL=info
```

---

## 🧪 Testing

### Test Scenarios

```bash
# Run tests (if configured)
npm test

# Run specific test
npm test -- --grep "Withdrawal Service"
```

### Manual Testing with cURL

```bash
# 1. Create User
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@test.com"}'

# 2. Create Sale
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{"userId":"JO123456E","brand":"brand_1","earning":1000}'

# 3. Get User Balance
curl http://localhost:3000/api/users/search?userId=JO123456E

# 4. Request Withdrawal
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{"userId":"JO123456E","amount":100}'

# 5. Complete Withdrawal
curl -X PATCH http://localhost:3000/api/withdrawals/507f1f77bcf86cd799439013/complete

# 6. Process Advance Payouts (Manual)
curl -X POST http://localhost:3000/api/payouts/advance \
  -H "Content-Type: application/json" \
  -d '{"userId":"JO123456E"}'

# 7. Debug Database
curl http://localhost:3000/api/payouts/debug/all
```

---

## 📊 Monitoring & Logging

### Log Files

| File | Content |
|------|---------|
| logs/combined.log | All logs (info, warn, error) |
| logs/error.log | Error-level logs only |

### Log Format (example)

```
2024-01-15T10:30:00.123Z [info]: MongoDB connected successfully
2024-01-15T10:30:01.456Z [info]: User created: JO123456E (John Doe)
2024-01-15T10:30:05.789Z [error]: Failed to process advance payout: Insufficient balance
```

### Monitoring Endpoints

| Endpoint | Purpose |
|---------|---------|
| GET /api/payouts/debug/all | Complete database snapshot |
| GET /api/users | All users with balances |
| GET /api/sales?status=pending | Pending sales for reconciliation |

### Health Check

```bash
# Basic health check
curl http://localhost:3000/
# Response: {"message":"User Payout Management System API"}
```

---

## 📈 Performance Considerations

| Aspect | Optimization |
|--------|--------------|
| Database Queries | Indexes on frequently queried fields |
| Batch Processing | Bulk operations for multiple payouts |
| Connection Pooling | MongoDB connection pool for performance |
| Caching | Future enhancement: Redis for user balances |
| Rate Limiting | Future enhancement: API rate limiting |
| Load Balancing | Stateless architecture enables horizontal scaling |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| Data Validation | Input sanitization and validation |
| Error Handling | No sensitive data in error messages |
| Helmet | Secure HTTP headers |
| CORS | Configurable CORS policies |
| Environment Variables | Sensitive config not in code |
| Idempotency | Prevents duplicate transactions |

---

## 🚧 Future Enhancements

| Feature | Priority | Description |
|---------|----------|-------------|
| Email Notifications | High | Send email on sale creation, withdrawal status |
| Webhook Support | High | Notify external systems on events |
| Admin Dashboard | Medium | Web UI for monitoring and management |
| Multiple Currencies | Medium | Support for different currencies |
| Payment Gateway | Low | Direct bank transfers via API |
| Analytics | Low | Payout analytics and reports |
| Rate Limiting | Medium | Prevent API abuse |
| OAuth2 | High | Secure API access |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: git checkout -b feature/your-feature
3. Commit your changes: git commit -m "feat: description"
4. Push to the branch: git push origin feature/your-feature
5. Open a Pull Request and describe your changes

---

## 🧾 License

This project is provided as-is for reference. Add a proper license file (e.g., MIT) if you plan to open-source it.

---

## ✍️ Author

- Your Name — https://github.com/yourusername


---

*This README was generated to match the provided project specification. Adjust content (URLs, author, commands) as needed before publishing.*

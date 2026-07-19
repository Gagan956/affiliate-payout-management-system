# Database Schema

The application stores data in four collections.

---

## User

| Field | Type |
|-------|------|
| userId | String |
| name | String |
| email | String |
| withdrawableBalance | Number |
| totalEarnings | Number |
| totalAdvanceReceived | Number |
| createdAt | Date |

---

## Sale

| Field | Type |
|-------|------|
| userId | ObjectId |
| brand | String |
| earning | Number |
| status | String |
| advancePaid | Boolean |
| advanceAmount | Number |
| payoutId | ObjectId |

---

## Payout

| Field | Type |
|-------|------|
| userId | ObjectId |
| amount | Number |
| type | String |
| status | String |
| saleId | ObjectId |
| withdrawalId | ObjectId |

---

## Withdrawal

| Field | Type |
|-------|------|
| userId | ObjectId |
| amount | Number |
| status | String |
| payoutId | ObjectId |
| retryCount | Number |

---

# Relationships

User (1)
│
├──────────────┐
│              │
▼              ▼
Sales(N)   Withdrawals(N)
│
▼
Payouts(N)

Every Sale belongs to one User.

Every Withdrawal belongs to one User.

Every Payout belongs to one User.

A Payout may reference a Sale or Withdrawal.
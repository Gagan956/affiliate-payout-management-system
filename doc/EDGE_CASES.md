# Edge Cases & Failure Scenarios

## User

- Duplicate email registration
- Invalid user ID
- Missing required fields

---

## Sales

- Sale amount less than zero
- Duplicate sale creation
- Invalid brand
- Sale already reconciled

---

## Advance Payout

- Duplicate advance payout
- Advance already processed
- Invalid payout amount

---

## Reconciliation

- Sale already approved
- Sale already rejected
- Invalid reconciliation status

---

## Withdrawal

- Insufficient balance
- Amount below minimum limit
- Withdrawal cooldown active
- Duplicate withdrawal request

---

## Failed Withdrawal

- Bank/API failure
- Timeout during processing
- Retry exceeded
- Automatic balance recovery

---

## Database

- MongoDB connection failure
- Transaction rollback on failure
- Validation errors

---

## Server

- Invalid JSON
- Unknown route
- Internal server error
- Unhandled exceptions

---

## Logging

All failures are recorded using Winston logger for easier debugging and monitoring.
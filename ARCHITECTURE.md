# System Architecture: Bill Management with Payment Features

## 🏛️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │              Bill Management Component                    │    │
│  │  - View bills table                                       │    │
│  │  - View bill details                                      │    │
│  │  - Payment management UI                                  │    │
│  │  - Add/delete payments                                    │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ uses                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                   Bill Form Component                     │    │
│  │  - Create/edit bills                                      │    │
│  │  - Room dropdown (FIXED: shows boarding house)           │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ uses                                    │
│  ┌──────────────────────┬──────────────────────────────────┐      │
│  │   Bill Service       │      Room Service (FIXED)        │      │
│  │  - getBills()        │   - getRooms() ← includes       │      │
│  │  - addPayment() ←    │     boarding house info         │      │
│  │  - deletePayment() ← │                                 │      │
│  └──────────────────────┴──────────────────────────────────┘      │
│                           ↓ HTTP                                    │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY / ROUTER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  POST   /api/owner/bills/:id/payments           ← Add payment      │
│  DELETE /api/owner/bills/:billId/payments/:id   ← Delete payment   │
│  GET    /api/owner/bills                         ← Get bills       │
│  GET    /api/owner/bills/:id                     ← Get bill        │
│  GET    /api/owner/rooms?includeBoardingHouse=true ← Get rooms     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │               Bill Controller                             │    │
│  │  - addPayment()         ← Handles payment creation        │    │
│  │  - deletePayment()      ← Handles payment deletion        │    │
│  │  - getBills()                                             │    │
│  │  - getBill()                                              │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ uses                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │            Validators (express-validator)                 │    │
│  │  - addPaymentValidator   ← Validates payment data         │    │
│  │  - deletePaymentValidator                                 │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ delegates to                            │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                  Bill Service                             │    │
│  │  - addPaymentToBill()   ← Creates payment + updates bill │    │
│  │  - deletePayment()      ← Deletes payment + updates bill │    │
│  │  - recalculateBillStatus() ← Auto-updates status ★       │    │
│  │  - getBillById()                                          │    │
│  │  - getBills()                                             │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ uses                                    │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │                  Room Service (FIXED)                     │    │
│  │  - getRooms() ← Now includes boarding house ★            │    │
│  │    • Eager loads BoardingHouse                            │    │
│  │    • Maps boardingHouseName to root                       │    │
│  └───────────────────────────────────────────────────────────┘    │
│                           ↓ uses                                    │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (Sequelize ORM)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │     Bill     │  │   Payment    │  │     Room     │            │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤            │
│  │ id           │  │ id           │  │ id           │            │
│  │ room_id   ───┼──┼─→bill_id     │  │ boarding_    │            │
│  │ period       │  │ tenant_id    │  │ house_id  ───┼──┐         │
│  │ total_amount │  │ amount       │  │ name         │  │         │
│  │ status ★     │  │ method ★     │  │ price        │  │         │
│  │ due_date     │  │ note         │  │ status       │  │         │
│  │ is_active    │  │ image_url    │  │ is_active    │  │         │
│  └──────────────┘  │ paid_at      │  └──────────────┘  │         │
│                    │ created_at   │                    │         │
│                    │ updated_at   │                    │         │
│                    └──────────────┘                    │         │
│                                                         │         │
│  ┌──────────────┐  ┌──────────────┐                   │         │
│  │ BoardingHouse│  │   Tenant     │                   │         │
│  ├──────────────┤  ├──────────────┤                   │         │
│  │ id        ←──┼──┘  │ id           │                   │         │
│  │ owner_id     │  │ name         │                   │         │
│  │ name         │  │ email        │                   │         │
│  │ address      │  │ phone        │                   │         │
│  │ is_active    │  │ id_number    │                   │         │
│  └──────────────┘  │ is_active    │                   │         │
│                    └──────────────┘                    │         │
│                                                         │         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL Database                            │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow: Add Payment

```
┌────────────┐
│   User     │
│  (Owner)   │
└─────┬──────┘
      │ 1. Clicks "Add Payment"
      ↓
┌────────────────────────────────────┐
│  Bill Management Component         │
│  - Opens add payment dialog        │
│  - Shows form: tenant, amount,     │
│    method, note                    │
└─────┬──────────────────────────────┘
      │ 2. Submits form
      ↓
┌────────────────────────────────────┐
│  Bill Service (Frontend)           │
│  addPaymentToBill(billId, data)   │
└─────┬──────────────────────────────┘
      │ 3. HTTP POST /api/owner/bills/:id/payments
      ↓
┌────────────────────────────────────┐
│  Bill Controller (Backend)         │
│  - Validates request                │
│  - Starts transaction              │
└─────┬──────────────────────────────┘
      │ 4. Delegates to service
      ↓
┌────────────────────────────────────┐
│  Bill Service (Backend)            │
│  addPaymentToBill()                │
│  ┌──────────────────────────────┐ │
│  │ 1. Verify bill ownership     │ │
│  │ 2. Validate tenant exists    │ │
│  │ 3. Create payment record     │ │
│  │ 4. Call recalculateBillStatus│ │
│  │    ┌──────────────────────┐  │ │
│  │    │ a. Sum all payments  │  │ │
│  │    │ b. Compare to total  │  │ │
│  │    │ c. Update status:    │  │ │
│  │    │    - paid (>=total)  │  │ │
│  │    │    - partial (>0)    │  │ │
│  │    │    - unpaid (=0)     │  │ │
│  │    └──────────────────────┘  │ │
│  │ 5. Return updated bill       │ │
│  └──────────────────────────────┘ │
└─────┬──────────────────────────────┘
      │ 5. Transaction commits
      ↓
┌────────────────────────────────────┐
│  Response: Updated Bill            │
│  {                                  │
│    id: "...",                       │
│    status: "partial",               │
│    payments: [                      │
│      { amount: 500000, ... }        │
│    ]                                │
│  }                                  │
└─────┬──────────────────────────────┘
      │ 6. Updates UI
      ↓
┌────────────────────────────────────┐
│  Bill Management Component         │
│  - Updates selected bill           │
│  - Shows success message           │
│  - Displays new payment in list    │
│  - Updates status badge            │
└────────────────────────────────────┘
```

## 🔑 Key Design Decisions

### 1. **Auto Status Update** ★
- **Why**: Eliminate manual status management errors
- **How**: `recalculateBillStatus()` called after every payment change
- **Logic**: 
  ```
  if (totalPaid >= totalAmount) → 'paid'
  else if (totalPaid > 0) → 'partial'
  else → 'unpaid'
  ```

### 2. **Transaction Safety**
- **Why**: Ensure data consistency
- **How**: All payment operations wrapped in database transactions
- **Example**: If payment creation succeeds but status update fails, entire operation rolls back

### 3. **Eager Loading** ★
- **Why**: Avoid N+1 query problems
- **How**: Use Sequelize `include` to load related data in single query
- **Fixed**: `getRooms()` now includes BoardingHouse in query

### 4. **Owner Verification**
- **Why**: Security - prevent unauthorized access
- **How**: Every operation validates bill/room ownership through owner_id
- **Pattern**:
  ```javascript
  include: [{
    model: BoardingHouse,
    where: { owner_id: userId }
  }]
  ```

### 5. **Payment Method Badges**
- **Why**: Quick visual identification
- **How**: Color-coded badges for each payment type
- **Mapping**:
  - Cash → Green (most common)
  - Bank Transfer → Blue (formal)
  - E-wallets → Orange/Purple/Red (modern)

## 📊 Database Relationships

```
BoardingHouse ──┐
  │ id          │ 1:N
  └─────────────┼────→ Room
                │       │ id
                │       └─────────┐
                │                 │ 1:N
Tenant ─────────┼─────────────────┼────→ Bill
  │ id          │                 │       │ id
  │             │                 │       │ status
  │             │                 │       │ total_amount
  │             │                 │       └─────────┐
  │ N:N via     │                 │                 │ 1:N
  └─────────────┼─────────────────┼─────────────────┼────→ Payment
                                                    │       │ id
                                                            │ amount
                                                            │ method
                                                            │ paid_at
```

## 🎯 Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                  Bill Management Component                   │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │  Bills Table       │  │   Bill Detail Dialog        │   │
│  │  - List all bills  │  │   ┌───────────────────────┐ │   │
│  │  - Status badges   │  │   │ Bill Information      │ │   │
│  │  - Actions         │  │   │ - Room, Period, Amt   │ │   │
│  └────────────────────┘  │   └───────────────────────┘ │   │
│          │               │   ┌───────────────────────┐ │   │
│          │ view details  │   │ Payment Management ★  │ │   │
│          └───────────────┼──→│ - Payment list        │ │   │
│                          │   │ - Add payment button  │ │   │
│  ┌────────────────────┐  │   │ - Delete buttons      │ │   │
│  │  Bill Form Dialog  │  │   │ - Method badges       │ │   │
│  │  - Room dropdown ★ │  │   └───────────────────────┘ │   │
│  │  - Period input    │  └─────────────────────────────┘   │
│  │  - Amount input    │  ┌─────────────────────────────┐   │
│  │  - Status dropdown │  │  Add Payment Dialog         │   │
│  └────────────────────┘  │  - Tenant dropdown          │   │
│                          │  - Amount input (VND)       │   │
│                          │  - Method dropdown          │   │
│                          │  - Note textarea            │   │
│                          └─────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Configuration

### Environment Variables
```bash
# Backend
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boarding_house_db
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development
```

### Frontend Environment
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 🚀 Deployment Considerations

1. **Database Migrations**: Use Sequelize migrations for schema changes
2. **Environment Variables**: Use .env files (not committed)
3. **CORS Configuration**: Configure allowed origins
4. **Authentication**: Implement JWT or session-based auth
5. **Rate Limiting**: Add rate limiting to prevent abuse
6. **Logging**: Implement structured logging (Winston, etc.)
7. **Error Tracking**: Use Sentry or similar service
8. **CI/CD**: Set up automated testing and deployment

## 📈 Scalability Notes

- **Database Indexing**: Add indexes on foreign keys and frequently queried fields
- **Caching**: Implement Redis caching for frequently accessed data
- **Load Balancing**: Use Nginx or similar for multiple backend instances
- **CDN**: Serve frontend static assets via CDN
- **Database Replication**: Set up read replicas for heavy read operations
- **API Versioning**: Use `/api/v1/` for future-proofing

---

**Legend:**
- ★ = Fixed/New feature
- ← = Data flow direction
- ┌─┐ = Component/module boundary

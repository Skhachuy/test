# Quick Start Guide: Bill Management with Payment Features

Get up and running quickly with the bill management system.

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_NAME=boarding_house_db
DB_USER=postgres
DB_PASSWORD=your_password
NODE_ENV=development
PORT=3000
EOF

# Run database migrations (if available)
# npm run migrate

# Start development server
npm run dev
```

Backend will be available at `http://localhost:3000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Update environment if needed
# Edit: src/environments/environment.ts

# Start development server
ng serve
```

Frontend will be available at `http://localhost:4200`

---

## 📋 Key Features Overview

### 1. Bill Form - Room Selection (FIXED)

**Before:**
```
Dropdown shows: "Room 101"
```

**After:**
```
Dropdown shows: "Room 101 - Green House Apartments"
```

**How it works:**
- Backend includes boarding house info in room query
- Frontend displays full room information in dropdown

---

### 2. Payment Management

#### Add Payment
1. Open bill details
2. Click "Thêm thanh toán" (Add Payment)
3. Fill in:
   - Tenant
   - Amount (VND)
   - Payment method (Cash, Bank, Momo, etc.)
   - Note (optional)
4. Submit

**Result:** Payment is added, bill status updates automatically

#### Delete Payment
1. In bill details, find payment in list
2. Click trash icon
3. Confirm deletion

**Result:** Payment is removed, bill status recalculates

---

## 🎨 Payment Methods & Colors

| Method | Badge Color | API Value |
|--------|-------------|-----------|
| 💵 Tiền mặt | Green | `cash` |
| 🏦 Chuyển khoản | Blue | `bank_transfer` |
| 📱 Momo | Orange | `momo` |
| ⚡ ZaloPay | Purple | `zalopay` |
| 💳 VNPay | Red | `vnpay` |

---

## 🔄 Bill Status Flow

```
┌─────────────┐
│   UNPAID    │  Total Paid: 0 VND
│   (Red)     │
└──────┬──────┘
       │ Add payment (< total amount)
       ↓
┌─────────────┐
│   PARTIAL   │  Total Paid: > 0 but < Total Amount
│   (Orange)  │
└──────┬──────┘
       │ Add payment (>= remaining)
       ↓
┌─────────────┐
│    PAID     │  Total Paid: >= Total Amount
│   (Green)   │
└─────────────┘
```

---

## 📡 API Endpoints

### Bills
```
GET    /api/owner/bills              # Get all bills
GET    /api/owner/bills/:id          # Get single bill
POST   /api/owner/bills              # Create bill
PUT    /api/owner/bills/:id          # Update bill
DELETE /api/owner/bills/:id          # Delete bill
```

### Payments
```
POST   /api/owner/bills/:id/payments           # Add payment
DELETE /api/owner/bills/:billId/payments/:id   # Delete payment
```

### Rooms (FIXED)
```
GET    /api/owner/rooms?includeBoardingHouse=true  # Get rooms with house info
```

---

## 💻 Code Examples

### Frontend: Add Payment

```typescript
import { BillService } from './services/bill.service';
import { AddPaymentRequest } from './models/bill.model';

// In your component
addCashPayment(billId: string) {
  const payment: AddPaymentRequest = {
    tenantId: 'tenant-uuid',
    amount: 500000,
    method: 'cash',
    note: 'Thanh toán tiền phòng tháng 1'
  };

  this.billService.addPaymentToBill(billId, payment).subscribe({
    next: (updatedBill) => {
      console.log('Success! New status:', updatedBill.status);
    },
    error: (error) => {
      console.error('Error:', error);
    }
  });
}
```

### Backend: Service Layer

```javascript
const BillService = require('./services/owner/billService');

// Add payment with auto status update
const updatedBill = await BillService.addPaymentToBill(
  billId,
  {
    tenantId: 'tenant-uuid',
    amount: 500000,
    method: 'cash',
    note: 'Payment note'
  },
  userId,
  transaction
);

console.log('New status:', updatedBill.status);
```

---

## 🧪 Testing

### Test Scenario 1: Room Dropdown

1. Navigate to bill form
2. Click room dropdown
3. **Expected:** See "Room Name - Boarding House Name"
4. ✅ **Result:** Fixed!

### Test Scenario 2: Payment Flow

**Initial State:**
- Bill: 1,000,000 VND
- Status: UNPAID

**Actions:**
1. Add 500,000 VND cash payment
   - ✅ Status → PARTIAL
2. Add 500,000 VND bank transfer
   - ✅ Status → PAID
3. Delete second payment
   - ✅ Status → PARTIAL
4. Delete first payment
   - ✅ Status → UNPAID

### Test Scenario 3: Payment Methods

1. Add payments with different methods
2. **Expected:** Each shows colored badge
3. ✅ **Result:** Cash (green), Bank (blue), Momo (orange), etc.

---

## 🔍 Troubleshooting

### Issue: Room dropdown shows empty

**Solution:**
- Ensure backend includes boarding house in response
- Check `RoomService.getRooms()` includes `boardingHouse`
- Verify frontend sends `includeBoardingHouse=true`

### Issue: Bill status not updating

**Solution:**
- Check `recalculateBillStatus()` is called after payment changes
- Verify all payment operations use transactions
- Check database associations are properly configured

### Issue: Payment deletion not working

**Solution:**
- Ensure owner verification is passing
- Check payment belongs to owner's bill
- Verify cascade delete is not preventing deletion

---

## 📚 Documentation

For more details, see:

- **README.md** - System overview and setup
- **ARCHITECTURE.md** - System architecture and design
- **IMPLEMENTATION_SUMMARY.md** - Detailed implementation guide
- **USAGE_EXAMPLES.md** - Code examples and patterns

---

## 🎯 Next Steps

1. **Set up database:**
   - Create PostgreSQL database
   - Run migrations
   - Seed test data

2. **Configure authentication:**
   - Implement JWT or session-based auth
   - Add authentication middleware
   - Protect owner routes

3. **Test the system:**
   - Create sample bills
   - Add payments
   - Verify status updates

4. **Customize UI:**
   - Adjust colors to match brand
   - Modify labels/text
   - Add company logo

5. **Deploy:**
   - Set up production environment
   - Configure CORS
   - Enable HTTPS
   - Set up monitoring

---

## 💡 Tips

1. **Use transactions** for all payment operations
2. **Validate inputs** at both frontend and backend
3. **Show confirmation dialogs** before deleting
4. **Display loading states** during API calls
5. **Format currency** consistently (VND format)
6. **Use badges** for visual status indication
7. **Test edge cases** (negative amounts, etc.)
8. **Handle errors gracefully** with user messages
9. **Cache room data** to reduce API calls
10. **Keep documentation updated**

---

## ✅ Checklist

Before going to production:

- [ ] Database migrations created
- [ ] Authentication implemented
- [ ] Authorization rules configured
- [ ] Input validation comprehensive
- [ ] Error handling complete
- [ ] Loading states implemented
- [ ] Responsive design tested
- [ ] Cross-browser compatibility verified
- [ ] API rate limiting configured
- [ ] Logging and monitoring set up
- [ ] Backup strategy in place
- [ ] Security audit completed

---

## 📞 Support

For issues or questions:

1. Check documentation files
2. Review code comments
3. Check error logs
4. Test in isolation
5. Create minimal reproduction

---

## 🎉 You're Ready!

The system is now fully functional with:
- ✅ Fixed room loading with boarding house info
- ✅ Complete payment management
- ✅ Auto-updating bill status
- ✅ Payment method badges
- ✅ Responsive UI
- ✅ Comprehensive documentation

Happy coding! 🚀

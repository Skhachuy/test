# Usage Examples: Bill Payment Management

This guide provides practical examples of how to use the bill payment management system.

## 📚 Table of Contents

1. [Backend API Examples](#backend-api-examples)
2. [Frontend Service Examples](#frontend-service-examples)
3. [Component Examples](#component-examples)
4. [Database Query Examples](#database-query-examples)
5. [Testing Examples](#testing-examples)

---

## Backend API Examples

### 1. Get All Bills (with pagination)

**Request:**
```bash
GET /api/owner/bills?page=1&limit=10
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "roomId": "987fcdeb-51a2-43d7-9012-fedcba987654",
      "period": "2024-01",
      "totalAmount": 2000000,
      "status": "partial",
      "dueDate": "2024-01-31T00:00:00.000Z",
      "room": {
        "id": "987fcdeb-51a2-43d7-9012-fedcba987654",
        "name": "Room 101",
        "boardingHouse": {
          "id": "abc12345-def6-7890-ghij-klmnopqrstuv",
          "name": "Green House Apartments"
        }
      },
      "payments": [
        {
          "id": "payment-uuid-1",
          "amount": 1000000,
          "method": "cash",
          "paidAt": "2024-01-15T10:30:00.000Z",
          "tenant": {
            "id": "tenant-uuid-1",
            "name": "Nguyen Van A"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### 2. Add Payment to Bill

**Request:**
```bash
POST /api/owner/bills/123e4567-e89b-12d3-a456-426614174000/payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "tenantId": "tenant-uuid-1",
  "amount": 500000,
  "method": "cash",
  "note": "Thanh toán tiền phòng tháng 1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thêm thanh toán thành công",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "partial",
    "totalAmount": 2000000,
    "payments": [
      {
        "id": "payment-uuid-2",
        "amount": 500000,
        "method": "cash",
        "note": "Thanh toán tiền phòng tháng 1",
        "paidAt": "2024-01-20T14:45:00.000Z",
        "tenant": {
          "id": "tenant-uuid-1",
          "name": "Nguyen Van A"
        }
      }
    ]
  }
}
```

### 3. Delete Payment

**Request:**
```bash
DELETE /api/owner/bills/123e4567-e89b-12d3-a456-426614174000/payments/payment-uuid-2
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Xóa thanh toán thành công",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "unpaid",
    "payments": []
  }
}
```

### 4. Get Rooms with Boarding House Info (FIXED)

**Request:**
```bash
GET /api/owner/rooms?page=1&limit=200&includeBoardingHouse=true
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "room-uuid-1",
      "name": "Room 101",
      "boardingHouseId": "house-uuid-1",
      "boardingHouseName": "Green House Apartments",
      "price": 2000000,
      "status": "occupied",
      "boardingHouse": {
        "id": "house-uuid-1",
        "name": "Green House Apartments",
        "address": "123 Main St"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 200,
    "total": 25,
    "totalPages": 1
  }
}
```

---

## Frontend Service Examples

### 1. Bill Service Usage

```typescript
import { Component, OnInit } from '@angular/core';
import { BillService } from '../services/bill.service';
import { AddPaymentRequest } from '../models/bill.model';

export class MyComponent implements OnInit {
  constructor(private billService: BillService) {}

  ngOnInit() {
    // Load bills
    this.loadBills();
  }

  loadBills() {
    this.billService.getBills(1, 10).subscribe({
      next: (response) => {
        console.log('Bills:', response.data);
        console.log('Total:', response.pagination.total);
      },
      error: (error) => {
        console.error('Error loading bills:', error);
      }
    });
  }

  addPayment(billId: string) {
    const payment: AddPaymentRequest = {
      tenantId: 'tenant-uuid',
      amount: 500000,
      method: 'cash',
      note: 'Payment for January'
    };

    this.billService.addPaymentToBill(billId, payment).subscribe({
      next: (updatedBill) => {
        console.log('Payment added! New status:', updatedBill.status);
        // UI automatically updates
      },
      error: (error) => {
        console.error('Error adding payment:', error);
      }
    });
  }

  deletePayment(billId: string, paymentId: string) {
    this.billService.deletePayment(billId, paymentId).subscribe({
      next: (updatedBill) => {
        console.log('Payment deleted! New status:', updatedBill.status);
      },
      error: (error) => {
        console.error('Error deleting payment:', error);
      }
    });
  }
}
```

### 2. Room Service Usage (FIXED)

```typescript
import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';

export class BillFormComponent implements OnInit {
  rooms: Room[] = [];
  roomOptions: any[] = [];

  constructor(private roomService: RoomService) {}

  ngOnInit() {
    this.loadAllRooms();
  }

  // ✅ FIXED: Now loads boarding house info
  loadAllRooms() {
    this.roomService.getRooms(1, 200, { includeAll: true }).subscribe({
      next: (response) => {
        this.rooms = response.data;
        
        // Map to dropdown options with boarding house name
        this.roomOptions = this.rooms.map((room) => ({
          label: `${room.name} - ${room.boardingHouseName}`, // ✅ Works now!
          value: room.id,
          data: room
        }));
        
        console.log('Room options:', this.roomOptions);
        // Output: [
        //   { label: "Room 101 - Green House", value: "uuid-1", ... },
        //   { label: "Room 102 - Green House", value: "uuid-2", ... }
        // ]
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }
}
```

---

## Component Examples

### 1. Bill Management Component - Payment Methods

```typescript
export class BillManagementComponent {
  paymentMethodOptions = [
    { label: 'Tiền mặt', value: 'cash' },
    { label: 'Chuyển khoản', value: 'bank_transfer' },
    { label: 'Momo', value: 'momo' },
    { label: 'ZaloPay', value: 'zalopay' },
    { label: 'VNPay', value: 'vnpay' }
  ];

  getPaymentMethodLabel(method: string): string {
    const option = this.paymentMethodOptions.find(opt => opt.value === method);
    return option?.label || method;
  }

  getPaymentMethodSeverity(method: string): string {
    const severityMap = {
      'cash': 'success',
      'bank_transfer': 'info',
      'momo': 'warning',
      'zalopay': 'primary',
      'vnpay': 'danger'
    };
    return severityMap[method] || 'secondary';
  }
}
```

**Template Usage:**
```html
<p-tag
  [value]="getPaymentMethodLabel(payment.method)"
  [severity]="getPaymentMethodSeverity(payment.method)"
></p-tag>
```

### 2. Status Badge Component

```typescript
getStatusSeverity(status: string): string {
  switch (status) {
    case 'paid':
      return 'success';    // Green
    case 'partial':
      return 'warning';    // Orange
    case 'unpaid':
      return 'danger';     // Red
    default:
      return 'secondary';  // Gray
  }
}

getStatusLabel(status: string): string {
  const labels = {
    'paid': 'Đã thanh toán',
    'partial': 'Thanh toán một phần',
    'unpaid': 'Chưa thanh toán'
  };
  return labels[status] || status;
}
```

**Template Usage:**
```html
<p-tag
  [value]="getStatusLabel(bill.status)"
  [severity]="getStatusSeverity(bill.status)"
></p-tag>
```

### 3. Currency Formatting

```typescript
formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

// Usage
console.log(formatCurrency(1500000));
// Output: "1.500.000 ₫"
```

---

## Database Query Examples

### 1. Get Bill with Payments (Sequelize)

```javascript
const bill = await Bill.findOne({
  where: { id: billId, is_active: true },
  include: [
    {
      model: Room,
      as: 'room',
      include: [
        {
          model: BoardingHouse,
          as: 'boardingHouse',
          where: { owner_id: userId },
          attributes: ['id', 'name']
        }
      ]
    },
    {
      model: Payment,
      as: 'payments',
      include: [
        {
          model: Tenant,
          as: 'tenant',
          attributes: ['id', 'name']
        }
      ],
      order: [['paid_at', 'DESC']]
    }
  ]
});
```

### 2. Calculate Total Paid Amount

```javascript
const totalPaid = bill.payments.reduce((sum, payment) => {
  return sum + parseFloat(payment.amount);
}, 0);

console.log(`Total paid: ${totalPaid}`);
// Output: Total paid: 1500000
```

### 3. Auto-Update Bill Status

```javascript
async function recalculateBillStatus(billId, transaction) {
  const bill = await Bill.findByPk(billId, {
    include: [{ model: Payment, as: 'payments' }],
    transaction
  });

  const totalPaid = bill.payments.reduce(
    (sum, p) => sum + parseFloat(p.amount), 
    0
  );
  const totalAmount = parseFloat(bill.total_amount);

  let status = 'unpaid';
  if (totalPaid >= totalAmount) {
    status = 'paid';
  } else if (totalPaid > 0) {
    status = 'partial';
  }

  await bill.update({ status }, { transaction });
}
```

---

## Testing Examples

### 1. Unit Test: Bill Service

```javascript
describe('BillService', () => {
  it('should add payment and update status to partial', async () => {
    const billId = 'bill-uuid';
    const paymentData = {
      tenantId: 'tenant-uuid',
      amount: 500000,
      method: 'cash'
    };
    
    const updatedBill = await BillService.addPaymentToBill(
      billId,
      paymentData,
      'owner-uuid',
      transaction
    );
    
    expect(updatedBill.status).toBe('partial');
    expect(updatedBill.payments).toHaveLength(1);
    expect(updatedBill.payments[0].amount).toBe(500000);
  });

  it('should update status to paid when fully paid', async () => {
    const billId = 'bill-uuid';
    const bill = await Bill.findByPk(billId);
    expect(bill.total_amount).toBe(1000000);
    
    // Add full payment
    await BillService.addPaymentToBill(
      billId,
      { tenantId: 'tenant-uuid', amount: 1000000, method: 'cash' },
      'owner-uuid',
      transaction
    );
    
    const updatedBill = await Bill.findByPk(billId);
    expect(updatedBill.status).toBe('paid');
  });
});
```

### 2. Integration Test: Payment API

```javascript
describe('POST /api/owner/bills/:id/payments', () => {
  it('should add payment successfully', async () => {
    const response = await request(app)
      .post('/api/owner/bills/bill-uuid/payments')
      .set('Authorization', 'Bearer token')
      .send({
        tenantId: 'tenant-uuid',
        amount: 500000,
        method: 'cash',
        note: 'Test payment'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.payments).toHaveLength(1);
  });

  it('should return 400 for invalid amount', async () => {
    const response = await request(app)
      .post('/api/owner/bills/bill-uuid/payments')
      .set('Authorization', 'Bearer token')
      .send({
        tenantId: 'tenant-uuid',
        amount: -100,
        method: 'cash'
      });
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### 3. Frontend Component Test

```typescript
describe('BillManagementComponent', () => {
  it('should load bills on init', () => {
    const bills = [
      { id: '1', status: 'paid', totalAmount: 1000000 },
      { id: '2', status: 'unpaid', totalAmount: 2000000 }
    ];
    
    billServiceSpy.getBills.and.returnValue(of({
      data: bills,
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
    }));
    
    component.ngOnInit();
    
    expect(component.bills).toEqual(bills);
    expect(billServiceSpy.getBills).toHaveBeenCalled();
  });

  it('should show payment method badge with correct color', () => {
    expect(component.getPaymentMethodSeverity('cash')).toBe('success');
    expect(component.getPaymentMethodSeverity('bank_transfer')).toBe('info');
    expect(component.getPaymentMethodSeverity('momo')).toBe('warning');
  });
});
```

---

## Common Usage Scenarios

### Scenario 1: Creating a Bill with First Payment

```typescript
// Step 1: Create bill
const billData = {
  roomId: 'room-uuid',
  period: '2024-01',
  totalAmount: 2000000,
  dueDate: '2024-01-31',
  status: 'unpaid'
};

this.billService.createBill(billData).subscribe({
  next: (newBill) => {
    // Step 2: Add first payment
    const payment: AddPaymentRequest = {
      tenantId: 'tenant-uuid',
      amount: 1000000,
      method: 'cash',
      note: 'First installment'
    };
    
    this.billService.addPaymentToBill(newBill.id, payment).subscribe({
      next: (updatedBill) => {
        console.log('Bill created and first payment added');
        console.log('Status:', updatedBill.status); // 'partial'
      }
    });
  }
});
```

### Scenario 2: Complete Payment Workflow

```typescript
// Initial: Bill = 2,000,000 VND, Status = 'unpaid'

// Payment 1: 500,000 VND (cash)
addPayment({ amount: 500000, method: 'cash' });
// → Status changes to 'partial' (500k / 2M)

// Payment 2: 700,000 VND (bank transfer)
addPayment({ amount: 700000, method: 'bank_transfer' });
// → Status remains 'partial' (1.2M / 2M)

// Payment 3: 800,000 VND (momo)
addPayment({ amount: 800000, method: 'momo' });
// → Status changes to 'paid' (2M / 2M)

// Correction: Delete Payment 3 (mistake)
deletePayment(payment3.id);
// → Status reverts to 'partial' (1.2M / 2M)

// Payment 4: 800,000 VND (cash - correct)
addPayment({ amount: 800000, method: 'cash' });
// → Status changes to 'paid' (2M / 2M)
```

### Scenario 3: Room Dropdown Population (FIXED)

```typescript
// OLD (Broken): Room name without boarding house
loadAllRooms() {
  this.roomService.getRooms(1, 200).subscribe({
    next: (response) => {
      // ❌ boardingHouseName is undefined
      this.roomOptions = response.data.map(room => ({
        label: room.name,  // Just "Room 101"
        value: room.id
      }));
    }
  });
}

// NEW (Fixed): Room name with boarding house
loadAllRooms() {
  this.roomService.getRooms(1, 200, { includeAll: true }).subscribe({
    next: (response) => {
      // ✅ boardingHouseName is populated
      this.roomOptions = response.data.map(room => ({
        label: `${room.name} - ${room.boardingHouseName}`,
        // "Room 101 - Green House"
        value: room.id
      }));
    }
  });
}
```

---

## Error Handling Examples

### Backend Error Response

```json
{
  "success": false,
  "message": "Không thể thêm thanh toán",
  "error": "Số tiền phải lớn hơn 0"
}
```

### Frontend Error Handling

```typescript
this.billService.addPaymentToBill(billId, payment).subscribe({
  next: (updatedBill) => {
    this.messageService.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm thanh toán thành công'
    });
  },
  error: (error) => {
    this.messageService.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.error?.message || 'Không thể thêm thanh toán'
    });
  }
});
```

---

## Tips and Best Practices

1. **Always use transactions** for payment operations
2. **Validate data** at both frontend and backend
3. **Use confirmation dialogs** before deleting payments
4. **Display loading states** during async operations
5. **Format currency** consistently (VND format)
6. **Use badges** for visual status indication
7. **Implement pagination** for large datasets
8. **Cache room data** to avoid repeated API calls
9. **Handle errors gracefully** with user-friendly messages
10. **Test edge cases** (negative amounts, missing data, etc.)

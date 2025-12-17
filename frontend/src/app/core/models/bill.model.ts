export interface Bill {
  id: string;
  roomId: string;
  roomName?: string;
  boardingHouseName?: string;
  period: string;
  totalAmount: number;
  status: 'unpaid' | 'partial' | 'paid';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  room?: Room;
}

export interface Payment {
  id: string;
  billId: string;
  tenantId: string;
  tenantName?: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  note?: string;
  imageUrl?: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant;
}

export interface Room {
  id: string;
  boardingHouseId: string;
  boardingHouseName?: string;
  name: string;
  floor?: number;
  area?: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
  boardingHouse?: BoardingHouse;
}

export interface BoardingHouse {
  id: string;
  ownerId: string;
  name: string;
  address?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  idNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentRequest {
  tenantId: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  note?: string;
  imageUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

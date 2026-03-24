export interface Item {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  isActive: boolean;
  prices?: ItemPrice[];
  currentPrice?: number;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ItemPrice {
  id: number;
  itemId: number;
  price: string; // Decimal from Prisma comes as string in JSON
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface CartItem extends Item {
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  role: 'ADMIN' | 'CASHIER' | 'NORMAL';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Transaction {
  id: number;
  type: 'SALE' | 'SPIN';
  subtotal: string;
  tipAmount: string | null;
  totalAmount: string;
  userId: number;
  createdAt: string;
  spinResult?: string;
}

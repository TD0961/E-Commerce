export interface User {
  uid: string;
  email?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  priceSnapshot: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'failed' | 'shipped';
  paymentIntentId: string;
  clientSecret?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserInteraction {
  userId: string;
  event: 'checkout_started' | 'purchase_completed' | 'product_viewed';
  productIds: string[];
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  category: string;
  imageURL: string;
  images?: string[];
  stock: number;
  status: 'active' | 'inactive';
  featured?: boolean; // Mostrar na landing page
  rating?: number;
  reviews?: number;
  colors?: string[];
  sizes?: string[];
  specifications?: { [key: string]: string };
  createdAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: string;
  };
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  items: any[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: any;
}

export type NotificationType = 'order_status' | 'new_order' | 'new_product' | 'promo' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: {
    orderId?: string;
    productId?: string;
    orderStatus?: string;
    link?: string;
  };
  createdAt: any;
}

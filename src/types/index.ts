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

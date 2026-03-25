// ============================================
// ATTRIBUTE SYSTEM
// ============================================

export type AttributeType = 'color' | 'size' | 'capacity';

export const CATEGORY_ATTRIBUTES: Record<string, AttributeType[]> = {
  'Eletrónicos': ['color', 'capacity'],
  'Moda': ['color', 'size'],
  'Desporto': ['color', 'size'],
  'Casa': ['color'],
  'Beleza': [],
};

export const ATTRIBUTE_OPTIONS: Record<AttributeType, string[]> = {
  color: ['Preto', 'Branco', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Rosa', 'Cinza', 'Dourado', 'Prateado', 'Azul Titânio', 'Titânio Natural'],
  size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  capacity: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'],
};

export const COLOR_HEX_MAP: Record<string, string> = {
  'Preto': '#000000',
  'Branco': '#FFFFFF',
  'Azul': '#3B82F6',
  'Vermelho': '#EF4444',
  'Verde': '#22C55E',
  'Amarelo': '#EAB308',
  'Rosa': '#EC4899',
  'Cinza': '#6B7280',
  'Dourado': '#D4AF37',
  'Prateado': '#C0C0C0',
  'Azul Titânio': '#4A5568',
  'Titânio Natural': '#A8A29E',
};

export const ATTRIBUTE_LABELS: Record<AttributeType, string> = {
  color: 'Cor',
  size: 'Tamanho',
  capacity: 'Capacidade',
};

export interface ProductAttribute {
  type: AttributeType;
  values: string[];
}

// ============================================
// VARIANT SYSTEM
// ============================================

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Partial<Record<AttributeType, string>>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageURL?: string;
  isDefault?: boolean;
  isActive: boolean;
}

// ============================================
// MEDIA SYSTEM
// ============================================

export interface ProductMedia {
  id: string;
  type: 'image' | 'video' | 'external';
  url: string;
  thumbnailURL?: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVideo {
  id: string;
  youtubeUrl: string;
  title?: string;
}

// ============================================
// SPECIFICATIONS
// ============================================

export interface ProductSpecification {
  key: string;
  value: string;
  group?: string;
}

// ============================================
// PRODUCT TYPE
// ============================================

export type ProductType = 'simple' | 'variable';

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
  featured?: boolean;

  // Tipo de produto
  type?: ProductType;

  // Produto Simples
  price: number;
  oldPrice?: number;
  stock: number;
  sku?: string;

  // Produto Variável
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];

  // Media
  imageURL: string;
  gallery?: ProductMedia[];
  videos?: ProductVideo[];

  // Legado (compatibilidade)
  images?: string[];
  colors?: string[];
  sizes?: string[];

  // Especificações
  specifications?: ProductSpecification[];
  datasheetURL?: string;

  // Metadata
  rating?: number;
  reviews?: number;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

// ============================================
// CART ITEM
// ============================================

export interface CartItem extends Omit<Product, 'variants'> {
  quantity: number;
  selectedVariant?: ProductVariant;
}

// ============================================
// ORDER
// ============================================

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

// ============================================
// CUSTOMER
// ============================================

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: any;
}

// ============================================
// NOTIFICATION
// ============================================

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

// ============================================
// WISH
// ============================================

export interface Wish {
  id: string;
  name: string;
  email: string;
  categories: string[];
  products: string[];
  status: 'pending' | 'reviewed' | 'fulfilled';
  notes?: string;
  createdAt: any;
}

// ============================================
// UTILITY TYPES
// ============================================

export function isVariableProduct(product: Product): boolean {
  return product.type === 'variable' &&
         Array.isArray(product.variants) &&
         product.variants.length > 0;
}

export function isSimpleProduct(product: Product): boolean {
  return product.type === 'simple' || !product.type;
}

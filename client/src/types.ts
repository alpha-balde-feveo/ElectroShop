export type Category = {
  _id: string;
  name: string;
  slug: string;
};

export type Product = {
  _id: string;
  name: string;
  brand?: string;
  categoryId?: Category | string | null;
  price: number;
  oldPrice?: number;
  description?: string;
  specs?: Record<string, string>;
  stock: number;
  images: { url: string }[];
  createdAt?: string;
};

export type CartItem = {
  product: Product;
  qty: number;
};

export type OrderItem = {
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
};

export type Order = {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  promoCode?: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELED";
  createdAt?: string;
};

export type PromoInfo = {
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
};

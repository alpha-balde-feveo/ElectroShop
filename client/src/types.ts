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
  images: { url: string; label?: string }[];
  createdAt?: string;
};

export type CartItem = {
  product: Product;
  qty: number;
  /** Variante choisie (ex : couleur) */
  variant?: string;
};

export type OrderItem = {
  productId: string;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
};

export type ShippingMode = "STANDARD" | "EXPRESS" | "PICKUP";
export type PaymentMethod = "ON_DELIVERY" | "WAVE" | "CASH_ON_SITE";

export type Order = {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  items: OrderItem[];
  shippingMode?: ShippingMode;
  paymentMethod?: PaymentMethod;
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

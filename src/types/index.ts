export type Language = 'en' | 'ta';

export type ProductCategory = 
  | 'all'
  | 'rice_grains'
  | 'dals_pulses'
  | 'spices_masala'
  | 'oils_ghee'
  | 'daily_essentials';

export interface ProductVariant {
  id: string;
  labelEn: string;
  labelTa: string;
  multiplier: number; // multiplier against base unit price
  unitLabel: string;
  stockInUnits: number;
}

export interface Product {
  id: string;
  nameEn: string;
  nameTa: string;
  category: ProductCategory;
  basePrice: number; // Price for base unit (e.g., ₹ per 1 kg or ₹ per 1 L)
  baseUnit: 'kg' | 'g' | 'L' | 'ml' | 'pack' | 'piece';
  variants: ProductVariant[];
  currentStock: number; // in base units (e.g. 45 kg)
  minStockThreshold: number; // alert if currentStock <= threshold
  image: string;
  isAvailable: boolean;
  featured?: boolean;
  descriptionEn: string;
  descriptionTa: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  productNameEn: string;
  productNameTa: string;
  variantLabelEn: string;
  variantLabelTa: string;
  unitPrice: number;
  quantity: number;
  image: string;
  baseUnit: string;
  multiplier: number;
}

export type OrderStatus = 'pending' | 'packed' | 'out_for_delivery' | 'completed' | 'cancelled';

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'cod' | 'upi_qr';

export interface OrderItem {
  productId: string;
  variantId: string;
  productNameEn: string;
  productNameTa: string;
  variantLabelEn: string;
  variantLabelTa: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  multiplier: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress: string;
  landmark?: string;
  deliverySlot: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'received';
  status: OrderStatus;
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShopSettings {
  shopNameEn: string;
  shopNameTa: string;
  taglineEn: string;
  taglineTa: string;
  phone: string;
  whatsappPhone: string;
  addressEn: string;
  addressTa: string;
  townName: string;
  upiId: string;
  upiPayeeName: string;
  freeDeliveryThreshold: number;
  deliveryCharge: number;
  isOpen: boolean;
  openingHoursEn: string;
  openingHoursTa: string;
}

export interface QuickListItem {
  rawText: string;
  matchedProduct?: Product;
  matchedVariant?: ProductVariant;
  quantity: number;
}

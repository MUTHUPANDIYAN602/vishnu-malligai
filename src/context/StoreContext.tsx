import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Product, 
  Order, 
  CartItem, 
  Language, 
  ProductCategory, 
  OrderStatus, 
  ShopSettings, 
  ProductVariant 
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_SHOP_SETTINGS } from '../data/initialData';

interface PlaceOrderParams {
  customerName: string;
  customerPhone: string;
  deliveryType: 'delivery' | 'pickup';
  deliveryAddress: string;
  landmark?: string;
  deliverySlot: string;
  paymentMethod: 'cod' | 'upi_qr';
  notes?: string;
}

interface StoreContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: 'storefront' | 'dashboard' | 'tracking' | 'quick_list';
  setActiveView: (view: 'storefront' | 'dashboard' | 'tracking' | 'quick_list') => void;
  dashboardTab: 'orders' | 'inventory' | 'settings';
  setDashboardTab: (tab: 'orders' | 'inventory' | 'settings') => void;
  
  // Products / Inventory
  products: Product[];
  lowStockProducts: Product[];
  updateProductStock: (productId: string, deltaOrValue: number, isAbsolute?: boolean) => void;
  updateProductPrice: (productId: string, newBasePrice: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  
  // Catalog Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Orders
  orders: Order[];
  placeOrder: (params: PlaceOrderParams) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  latestPlacedOrder: Order | null;
  selectedOrderForReceipt: Order | null;
  setSelectedOrderForReceipt: (order: Order | null) => void;

  // Shop Settings
  shopSettings: ShopSettings;
  updateShopSettings: (settings: Partial<ShopSettings>) => void;

  // Notification sound
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  playOrderChime: () => void;

  // Tracking search
  trackedOrderPhoneOrId: string;
  setTrackedOrderPhoneOrId: (val: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'vishnu_malligai_products_v1',
  ORDERS: 'vishnu_malligai_orders_v1',
  SETTINGS: 'vishnu_malligai_settings_v1',
  LANG: 'vishnu_malligai_lang_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved === 'ta' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  // Views & Tabs
  const [activeView, setActiveView] = useState<'storefront' | 'dashboard' | 'tracking' | 'quick_list'>('storefront');
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'inventory' | 'settings'>('orders');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [trackedOrderPhoneOrId, setTrackedOrderPhoneOrId] = useState<string>('');

  // Audio Notifications
  const [audioEnabled, setAudioEnabled] = useState(true);

  const playOrderChime = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // Tone 1: High Bell (E5: ~659 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Tone 2: Harmonious Major Third (G#5: ~830 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.12);
      gain2.gain.setValueAtTime(0.15, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [audioEnabled]);

  // Products state with localStorage persistence
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PRODUCTS;
  });

  // Save products to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  // Orders state with localStorage persistence
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  // Shop Settings with persistence
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SHOP_SETTINGS;
  });

  const updateShopSettings = (newSettings: Partial<ShopSettings>) => {
    setShopSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Cross-tab real-time sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PRODUCTS && e.newValue) {
        setProducts(JSON.parse(e.newValue));
      }
      if (e.key === STORAGE_KEYS.ORDERS && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Search & Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  // Low stock products
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.currentStock <= p.minStockThreshold);
  }, [products]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product.id && item.variantId === variant.id
      );

      // Check price calculation
      const unitPrice = Math.round(product.basePrice * variant.multiplier);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          productNameEn: product.nameEn,
          productNameTa: product.nameTa,
          variantLabelEn: variant.labelEn,
          variantLabelTa: variant.labelTa,
          unitPrice,
          quantity,
          image: product.image,
          baseUnit: product.baseUnit,
          multiplier: variant.multiplier,
        }
      ];
    });
  };

  const updateCartQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, variantId: string) => {
    setCart(prev => prev.filter(item => !(item.productId === productId && item.variantId === variantId)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  // Real-time stock update
  const updateProductStock = (productId: string, deltaOrValue: number, isAbsolute: boolean = false) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        const newStock = isAbsolute ? Math.max(0, deltaOrValue) : Math.max(0, prod.currentStock + deltaOrValue);
        return {
          ...prod,
          currentStock: newStock,
          isAvailable: newStock > 0,
        };
      })
    );
  };

  const updateProductPrice = (productId: string, newBasePrice: number) => {
    setProducts(prev =>
      prev.map(prod => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          basePrice: Math.max(1, newBasePrice)
        };
      })
    );
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-custom-${Date.now()}`;
    const productWithId: Product = { ...newProd, id };
    setProducts(prev => [productWithId, ...prev]);
  };

  const editProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Place Order: Real-time stock deduction
  const placeOrder = (params: PlaceOrderParams): Order => {
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `VM-${orderNum}`;
    const now = new Date().toISOString();

    const orderItems = cart.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      productNameEn: item.productNameEn,
      productNameTa: item.productNameTa,
      variantLabelEn: item.variantLabelEn,
      variantLabelTa: item.variantLabelTa,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.unitPrice * item.quantity,
      multiplier: item.multiplier,
    }));

    const itemTotal = cartSubtotal;
    const deliveryFee = params.deliveryType === 'pickup' 
      ? 0 
      : (itemTotal >= shopSettings.freeDeliveryThreshold ? 0 : shopSettings.deliveryCharge);
    const totalAmount = itemTotal + deliveryFee;

    const newOrder: Order = {
      id: newOrderId,
      customerName: params.customerName.trim(),
      customerPhone: params.customerPhone.trim(),
      deliveryType: params.deliveryType,
      deliveryAddress: params.deliveryAddress.trim(),
      landmark: params.landmark?.trim(),
      deliverySlot: params.deliverySlot,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === 'upi_qr' ? 'received' : 'pending',
      status: 'pending',
      items: orderItems,
      itemTotal,
      deliveryFee,
      totalAmount,
      notes: params.notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    // Real-time stock reduction for each item
    setProducts(prev => {
      const nextProds = [...prev];
      for (const cartItem of cart) {
        const prodIndex = nextProds.findIndex(p => p.id === cartItem.productId);
        if (prodIndex > -1) {
          const target = nextProds[prodIndex];
          // calculate deduction in base units: quantity * variant multiplier
          const baseUnitsUsed = Math.round(cartItem.quantity * cartItem.multiplier * 10) / 10;
          const updatedStock = Math.max(0, target.currentStock - baseUnitsUsed);
          nextProds[prodIndex] = {
            ...target,
            currentStock: updatedStock,
            isAvailable: updatedStock > 0,
          };
        }
      }
      return nextProds;
    });

    // Add to orders
    setOrders(prev => [newOrder, ...prev]);
    setLatestPlacedOrder(newOrder);
    setTrackedOrderPhoneOrId(newOrderId);
    clearCart();
    playOrderChime();

    return newOrder;
  };

  // Update order status with optional stock restoration if cancelled
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === orderId);
      if (!order) return prev;

      // If cancelling an active order, restore inventory
      if (newStatus === 'cancelled' && order.status !== 'cancelled') {
        setProducts(currentProducts => {
          const updatedProducts = [...currentProducts];
          for (const item of order.items) {
            const pIdx = updatedProducts.findIndex(p => p.id === item.productId);
            if (pIdx > -1) {
              const p = updatedProducts[pIdx];
              const restoredUnits = Math.round(item.quantity * item.multiplier * 10) / 10;
              updatedProducts[pIdx] = {
                ...p,
                currentStock: p.currentStock + restoredUnits,
                isAvailable: true,
              };
            }
          }
          return updatedProducts;
        });
      }

      return prev.map(o =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              paymentStatus: (newStatus === 'completed' && o.paymentMethod === 'cod') ? 'received' : o.paymentStatus,
            }
          : o
      );
    });
  };

  return (
    <StoreContext.Provider
      value={{
        language,
        setLanguage,
        activeView,
        setActiveView,
        dashboardTab,
        setDashboardTab,
        products,
        lowStockProducts,
        updateProductStock,
        updateProductPrice,
        addProduct,
        editProduct,
        deleteProduct,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartItemCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        orders,
        placeOrder,
        updateOrderStatus,
        latestPlacedOrder,
        selectedOrderForReceipt,
        setSelectedOrderForReceipt,
        shopSettings,
        updateShopSettings,
        audioEnabled,
        setAudioEnabled,
        playOrderChime,
        trackedOrderPhoneOrId,
        setTrackedOrderPhoneOrId,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

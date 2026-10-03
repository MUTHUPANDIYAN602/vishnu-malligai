import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, Product, ProductCategory } from '../types';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Truck, 
  Printer, 
  Phone, 
  MessageSquare, 
  Plus, 
  Edit3, 
  Search, 
  Volume2, 
  VolumeX, 
  ShoppingBag, 
  RefreshCw, 
  Copy, 
  Check, 
  X,
  ExternalLink,
  ChevronRight,
  MapPin,
  Store,
  DollarSign
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { 
    orders, 
    products, 
    updateOrderStatus, 
    updateProductStock, 
    updateProductPrice,
    addProduct,
    editProduct,
    deleteProduct,
    lowStockProducts, 
    dashboardTab, 
    setDashboardTab, 
    language,
    shopSettings,
    updateShopSettings,
    setSelectedOrderForReceipt,
    audioEnabled,
    setAudioEnabled,
    playOrderChime,
    setActiveView
  } = useStore();

  const isTa = language === 'ta';

  // State for order search & filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // State for inventory search & filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');

  // Modal states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [copiedReorder, setCopiedReorder] = useState(false);

  // New Product Form State
  const [newProdNameEn, setNewProdNameEn] = useState('');
  const [newProdNameTa, setNewProdNameTa] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('rice_grains');
  const [newProdBasePrice, setNewProdBasePrice] = useState(60);
  const [newProdBaseUnit, setNewProdBaseUnit] = useState<'kg' | 'g' | 'L' | 'ml' | 'pack'>('kg');
  const [newProdStock, setNewProdStock] = useState(50);
  const [newProdThreshold, setNewProdThreshold] = useState(15);
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/product_rice_grains_1791049147721.jpg');
  const [newProdDescEn, setNewProdDescEn] = useState('');
  const [newProdDescTa, setNewProdDescTa] = useState('');

  // Calculate Metrics
  const todayRevenue = useMemo(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending');
  }, [orders]);

  const activeDeliveries = useMemo(() => {
    return orders.filter(o => o.status === 'out_for_delivery');
  }, [orders]);

  // Filter Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      if (!matchesStatus) return false;

      if (!orderSearchQuery.trim()) return true;
      const q = orderSearchQuery.toLowerCase().trim();
      return (
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        order.deliveryAddress.toLowerCase().includes(q)
      );
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Filter Inventory
  const filteredInventory = useMemo(() => {
    return products.filter(p => {
      const matchesCat = inventoryCategory === 'all' || p.category === inventoryCategory;
      if (!matchesCat) return false;

      if (!inventorySearch.trim()) return true;
      const q = inventorySearch.toLowerCase().trim();
      return (
        p.nameEn.toLowerCase().includes(q) ||
        p.nameTa.toLowerCase().includes(q)
      );
    });
  }, [products, inventoryCategory, inventorySearch]);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdNameEn.trim()) return;

    addProduct({
      nameEn: newProdNameEn.trim(),
      nameTa: newProdNameTa.trim() || newProdNameEn.trim(),
      category: newProdCategory,
      basePrice: Number(newProdBasePrice),
      baseUnit: newProdBaseUnit,
      currentStock: Number(newProdStock),
      minStockThreshold: Number(newProdThreshold),
      image: newProdImage,
      isAvailable: true,
      descriptionEn: newProdDescEn.trim() || 'Quality provisions from Vishnu Malligai.',
      descriptionTa: newProdDescTa.trim() || 'விஷ்ணு மளிகையின் தரமான மளிகைப் பொருள்.',
      variants: [
        {
          id: `v-1-${Date.now()}`,
          labelEn: `1 ${newProdBaseUnit} Pack`,
          labelTa: `1 ${newProdBaseUnit}`,
          multiplier: 1,
          unitLabel: `1 ${newProdBaseUnit}`,
          stockInUnits: Number(newProdStock),
        },
        {
          id: `v-5-${Date.now()}`,
          labelEn: `5 ${newProdBaseUnit} Value Pack`,
          labelTa: `5 ${newProdBaseUnit}`,
          multiplier: 4.85,
          unitLabel: `5 ${newProdBaseUnit}`,
          stockInUnits: Math.floor(Number(newProdStock) / 5),
        }
      ]
    });

    setIsAddProductOpen(false);
    // Reset form
    setNewProdNameEn('');
    setNewProdNameTa('');
    setNewProdDescEn('');
    setNewProdDescTa('');
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    editProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCopyReorderList = () => {
    let text = `*Vishnu Malligai - Mandi Wholesale Reorder List*\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN')}\n\n`;
    lowStockProducts.forEach((p, idx) => {
      text += `${idx + 1}. ${p.nameEn} (${p.nameTa}) - Current Stock: ${p.currentStock} ${p.baseUnit} (Threshold: ${p.minStockThreshold} ${p.baseUnit})\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedReorder(true);
    setTimeout(() => setCopiedReorder(false), 2000);
  };

  const sendWhatsAppUpdate = (order: Order) => {
    let msg = `*Vishnu Malligai (விஷ்ணு மளிகை) Update*\n\n`;
    msg += `Hello ${order.customerName},\n`;
    if (order.status === 'packed') {
      msg += `Your grocery order *#${order.id}* is freshly packed and ready for dispatch!\n`;
    } else if (order.status === 'out_for_delivery') {
      msg += `Your grocery order *#${order.id}* is OUT FOR DELIVERY to your address: ${order.deliveryAddress}.\n`;
    } else if (order.status === 'completed') {
      msg += `Your grocery order *#${order.id}* has been successfully delivered. Thank you for choosing Vishnu Malligai!\n`;
    } else {
      msg += `Your grocery order *#${order.id}* is received and currently being processed.\n`;
    }
    msg += `Total Amount: ₹${order.totalAmount} (${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via UPI'})\n`;
    msg += `Store Phone: ${shopSettings.phone}`;

    window.open(`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Dashboard Top Header & Audio Alerts Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
            <span>{isTa ? 'கடை நிர்வாகக் கட்டுப்பாட்டகம்' : 'Retail Shop Operations Dashboard'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-bold">{isTa ? 'நேரலை இயங்குகிறது' : 'Live Sync Active'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-1">
            {shopSettings.shopNameEn} <span className="font-normal text-stone-500">({shopSettings.shopNameTa})</span>
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {shopSettings.addressEn}
          </p>
        </div>

        {/* Dashboard Control Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) playOrderChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              audioEnabled 
                ? 'bg-amber-50 border-amber-300 text-amber-900' 
                : 'bg-stone-100 border-stone-200 text-stone-500'
            }`}
            title="Audio notification for new incoming orders"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-700" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? (isTa ? 'ஆர்டர் மணி: ஒலிக்கும்' : 'Order Chime: ON') : (isTa ? 'மணி: முடக்கப்பட்டது' : 'Order Chime: OFF')}</span>
          </button>

          {/* Test Chime Button */}
          <button
            onClick={playOrderChime}
            className="p-1.5 text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer text-xs"
            title="Test Chime Sound"
          >
            🔔
          </button>

          {/* Shop Open / Closed Toggle */}
          <button
            onClick={() => updateShopSettings({ isOpen: !shopSettings.isOpen })}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              shopSettings.isOpen 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            {shopSettings.isOpen ? (isTa ? '● கடை திறந்துள்ளது' : '● Shop Open') : (isTa ? '○ கடை மூடப்பட்டுள்ளது' : '○ Shop Closed')}
          </button>

          {/* Switch to customer view */}
          <button
            onClick={() => setActiveView('storefront')}
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <span>{isTa ? 'வாடிக்கையாளர் காட்சி' : 'Customer View'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isTa ? 'இன்றைய விற்பனை' : "Today's Revenue"}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 tabular-nums">
            ₹{todayRevenue}
          </p>
          <p className="text-[11px] text-stone-500">
            {orders.length} {isTa ? 'ஆர்டர்கள் பெறப்பட்டன' : 'total orders recorded'}
          </p>
        </div>

        {/* Pending to Pack */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isTa ? 'பேக்கிங் செய்ய வேண்டியவை' : 'Pending to Pack'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className={`text-2xl font-bold tabular-nums ${pendingOrders.length > 0 ? 'text-amber-800' : 'text-stone-900'}`}>
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-stone-500">
            {pendingOrders.length > 0 
              ? (isTa ? 'உடனடி கவனம் தேவை!' : 'Requires counter packing') 
              : (isTa ? 'அனைத்தும் தயாராக உள்ளது' : 'All orders packed')}
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => {
            setDashboardTab('inventory');
            if (lowStockProducts.length > 0) setIsReorderModalOpen(true);
          }}
          className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-1 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isTa ? 'குறைந்த இருப்பு எச்சரிக்கை' : 'Low Stock Alerts'}</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-amber-600 animate-pulse' : 'text-stone-400'}`} />
          </div>
          <p className={`text-2xl font-bold tabular-nums ${lowStockProducts.length > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
            {lowStockProducts.length}
          </p>
          <p className="text-[11px] text-amber-800 font-medium hover:underline">
            {lowStockProducts.length > 0 
              ? (isTa ? 'மண்டி கொள்முதல் பட்டியல் பார்க்க →' : 'View wholesale reorder list →') 
              : (isTa ? 'இருப்பு திருப்திகரமாக உள்ளது' : 'All stock levels healthy')}
          </p>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{isTa ? 'டெலிவரிக்கு சென்றவை' : 'Out for Delivery'}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-stone-900 tabular-nums">
            {activeDeliveries.length}
          </p>
          <p className="text-[11px] text-stone-500">
            {activeDeliveries.length} {isTa ? 'டெலிவரி பையிடம் உள்ளது' : 'on the way to customer'}
          </p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="border-b border-stone-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDashboardTab('orders')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              dashboardTab === 'orders'
                ? 'border-amber-800 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isTa ? 'வாடிக்கையாளர் ஆர்டர்கள்' : 'Customer Orders'}</span>
            <span className="bg-stone-200 text-stone-700 text-[10px] px-1.5 py-0.2 rounded-full tabular-nums">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setDashboardTab('inventory')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              dashboardTab === 'inventory'
                ? 'border-amber-800 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isTa ? 'சரக்கு இருப்பு & மறுஊட்டல்' : 'Live Inventory & Stock'}</span>
            {lowStockProducts.length > 0 && (
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {lowStockProducts.length} low
              </span>
            )}
          </button>

          <button
            onClick={() => setDashboardTab('settings')}
            className={`py-2 px-4 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 flex items-center gap-2 ${
              dashboardTab === 'settings'
                ? 'border-amber-800 text-amber-900 bg-amber-50/50'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>{isTa ? 'கடை அமைப்புகள்' : 'Shop Settings'}</span>
          </button>
        </div>

        {/* Contextual Action Button */}
        {dashboardTab === 'inventory' && (
          <div className="flex items-center gap-2 pb-1">
            <button
              onClick={() => setIsReorderModalOpen(true)}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-amber-800" />
              <span>{isTa ? 'மண்டி கொள்முதல் பட்டியல்' : 'Wholesale Reorder List'}</span>
            </button>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isTa ? 'புதிய பொருள் சேர்' : 'Add New Product'}</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: CUSTOMER ORDERS */}
      {dashboardTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: isTa ? 'அனைத்தும்' : 'All' },
                { id: 'pending', label: isTa ? 'பெறப்பட்டவை' : 'Pending' },
                { id: 'packed', label: isTa ? 'பேக் செய்யப்பட்டது' : 'Packed' },
                { id: 'out_for_delivery', label: isTa ? 'டெலிவரியில்' : 'Out for Delivery' },
                { id: 'completed', label: isTa ? 'முடிவடைந்தது' : 'Delivered' },
                { id: 'cancelled', label: isTa ? 'ரத்து' : 'Cancelled' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOrderStatusFilter(f.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    orderStatusFilter === f.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Order Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                placeholder={isTa ? 'ஆர்டர் எண், பெயர், போன்...' : 'Search ID, customer, phone...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-2">
              <Package className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold text-stone-700">
                {isTa ? 'ஆர்டர்கள் எதுவும் இல்லை' : 'No orders found matching criteria'}
              </p>
              <p className="text-xs text-stone-500">
                {isTa ? 'வேறு நிலைகளை தேர்வு செய்யவும் அல்லது தேடலை மாற்றவும்.' : 'Try changing status filters or search terms.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => {
                const timeAgoMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                const timeString = timeAgoMinutes < 1 ? 'Just now' : `${timeAgoMinutes} mins ago`;

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:border-amber-300 transition-all space-y-4"
                  >
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded">
                          {order.id}
                        </span>
                        <div className="text-xs text-stone-500 flex items-center gap-2">
                          <span>{timeString}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-stone-700">{order.deliverySlot}</span>
                        </div>
                      </div>

                      {/* Status Badges - Clean text style, no garish capsules */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                          order.status === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          order.status === 'packed' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                          order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-900 border border-purple-300' :
                          order.status === 'completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {order.status === 'pending' && (isTa ? '● பேக்கிங் தேவை' : '● Pending to Pack')}
                          {order.status === 'packed' && (isTa ? '● பேக் செய்யப்பட்டது' : '● Packed & Ready')}
                          {order.status === 'out_for_delivery' && (isTa ? '● டெலிவரியில் உள்ளது' : '● Out for Delivery')}
                          {order.status === 'completed' && (isTa ? '✓ டெலிவரி முடிந்தது' : '✓ Completed')}
                          {order.status === 'cancelled' && (isTa ? '✕ ரத்து செய்யப்பட்டது' : '✕ Cancelled')}
                        </span>
                      </div>
                    </div>

                    {/* Customer & Delivery Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Customer info */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                          {isTa ? 'வாடிக்கையாளர்' : 'Customer'}
                        </span>
                        <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1 text-stone-700 hover:text-amber-800 bg-stone-50 hover:bg-stone-100 px-2 py-0.5 rounded border border-stone-200"
                          >
                            <Phone className="w-3 h-3 text-stone-500" />
                            <span>{order.customerPhone}</span>
                          </a>
                          <button
                            onClick={() => sendWhatsAppUpdate(order)}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Delivery address */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                          {isTa ? 'டெலிவரி முறை & முகவரி' : 'Delivery & Address'}
                        </span>
                        <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                          {order.deliveryType === 'delivery' ? <Truck className="w-3.5 h-3.5 text-stone-600" /> : <Store className="w-3.5 h-3.5 text-stone-600" />}
                          <span>{order.deliveryType === 'delivery' ? (isTa ? 'வீட்டு டெலிவரி' : 'Home Delivery') : (isTa ? 'கடை பிக்அப்' : 'Store Pickup')}</span>
                        </p>
                        <p className="text-stone-600 leading-relaxed">
                          {order.deliveryAddress}
                          {order.landmark && ` (Landmark: ${order.landmark})`}
                        </p>
                        {order.notes && (
                          <p className="text-amber-800 font-medium text-[11px] pt-0.5">
                            Note: "{order.notes}"
                          </p>
                        )}
                      </div>

                      {/* Payment info */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
                          {isTa ? 'பணம் & பில் தொகை' : 'Payment & Total'}
                        </span>
                        <p className="text-stone-900 font-medium">
                          {order.paymentMethod === 'cod' ? (isTa ? 'பொருட்கள் பெற்ற பின் பணம் (COD)' : 'Cash on Delivery') : 'UPI Payment'}
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            order.paymentStatus === 'received' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            {order.paymentStatus === 'received' ? 'PAID' : 'PENDING'}
                          </span>
                        </p>
                        <p className="text-lg font-bold text-amber-900 tabular-nums">
                          ₹{order.totalAmount}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {order.items.length} {isTa ? 'பொருட்கள்' : 'items'} · {order.deliveryFee === 0 ? 'Free Delivery' : `Delivery: ₹${order.deliveryFee}`}
                        </p>
                      </div>
                    </div>

                    {/* Itemized Order Breakdown */}
                    <div className="bg-stone-50 rounded-lg p-3 space-y-1.5">
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-1">
                        {isTa ? 'பொருட்கள் விபரம் (எடையுடன்):' : 'Order Items & Weights:'}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-stone-200 text-xs">
                            <div className="truncate pr-2">
                              <span className="font-semibold text-stone-900">
                                {isTa ? item.productNameTa : item.productNameEn}
                              </span>
                              <span className="text-stone-500 text-[11px] ml-1">
                                ({item.variantLabelEn}) × {item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-stone-900 tabular-nums shrink-0">
                              ₹{item.subtotal}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Action Buttons Row */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                      
                      {/* Left: Print Thermal Bill & WhatsApp notify */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrderForReceipt(order)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>{isTa ? 'ரசீது அச்சிடு' : 'Print Thermal Bill'}</span>
                        </button>

                        <button
                          onClick={() => sendWhatsAppUpdate(order)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 border border-emerald-200"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isTa ? 'வாடிக்கையாளருக்கு வாட்ஸ்அப் செய்' : 'Send WhatsApp Alert'}</span>
                        </button>
                      </div>

                      {/* Right: Status Workflow Steppers */}
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'packed')}
                            className="px-4 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <Package className="w-3.5 h-3.5" />
                            <span>{isTa ? 'பேக்கிங் முடிந்தது' : 'Mark as Packed'}</span>
                          </button>
                        )}

                        {order.status === 'packed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'out_for_delivery')}
                            className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>{isTa ? 'டெலிவரிக்கு அனுப்பு' : 'Hand to Delivery Partner'}</span>
                          </button>
                        )}

                        {order.status === 'out_for_delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isTa ? 'டெலிவரி & பணம் பெறப்பட்டது' : 'Delivered & Paid'}</span>
                          </button>
                        )}

                        {order.status !== 'cancelled' && order.status !== 'completed' && (
                          <button
                            onClick={() => {
                              if (confirm(isTa ? 'இந்த ஆர்டரை ரத்து செய்து இருப்பை மீட்டெடுக்கவா?' : 'Cancel order and restore inventory?')) {
                                updateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            {isTa ? 'ரத்து' : 'Cancel'}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REAL-TIME INVENTORY & STOCK MANAGEMENT */}
      {dashboardTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Inventory Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: isTa ? 'அனைத்து சரக்கு' : 'All Inventory' },
                { id: 'rice_grains', label: isTa ? 'அரிசி' : 'Rice & Grains' },
                { id: 'dals_pulses', label: isTa ? 'பருப்பு' : 'Dals' },
                { id: 'spices_masala', label: isTa ? 'மசாலா' : 'Spices' },
                { id: 'oils_ghee', label: isTa ? 'எண்ணெய்' : 'Oils & Ghee' },
                { id: 'daily_essentials', label: isTa ? 'அன்றாட' : 'Staples' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setInventoryCategory(c.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    inventoryCategory === c.id
                      ? 'bg-amber-800 text-white'
                      : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Inventory Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder={isTa ? 'சரக்கு பொருள் தேட...' : 'Search inventory product...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>

          {/* Real-time Inventory Table */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{isTa ? 'பொருள் பெயர்' : 'Product'}</th>
                    <th className="py-3 px-3">{isTa ? 'அடிப்படை விலை' : 'Base Price'}</th>
                    <th className="py-3 px-3">{isTa ? 'நடப்பு இருப்பு (Real-time)' : 'Current Stock'}</th>
                    <th className="py-3 px-3">{isTa ? 'குறைந்த இருப்பு எச்சரிக்கை' : 'Reorder Alert Level'}</th>
                    <th className="py-3 px-4">{isTa ? 'விரைவு மறுஊட்டல் (1-Click Restock)' : 'Quick Restock'}</th>
                    <th className="py-3 px-4 text-right">{isTa ? 'நடவடிக்கை' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredInventory.map(product => {
                    const isLow = product.currentStock <= product.minStockThreshold && product.currentStock > 0;
                    const isOut = product.currentStock <= 0;

                    return (
                      <tr key={product.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Name & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img 
                              src={product.image} 
                              alt={product.nameEn}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0" 
                            />
                            <div>
                              <p className="font-semibold text-stone-900">{product.nameEn}</p>
                              <p className="text-[11px] text-stone-500">{product.nameTa}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-3 font-semibold text-stone-900 tabular-nums">
                          ₹{product.basePrice} / {product.baseUnit}
                        </td>

                        {/* Stock Level with health indicator */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold tabular-nums text-sm ${
                              isOut ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-stone-900'
                            }`}>
                              {product.currentStock} {product.baseUnit}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              isOut ? 'bg-red-100 text-red-800' :
                              isLow ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-50 text-emerald-800'
                            }`}>
                              {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Good'}
                            </span>
                          </div>
                        </td>

                        {/* Threshold */}
                        <td className="py-3 px-3 text-stone-500 tabular-nums">
                          ≤ {product.minStockThreshold} {product.baseUnit}
                        </td>

                        {/* Quick Restock Buttons */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {[5, 10, 25, 50].map(amt => (
                              <button
                                key={amt}
                                onClick={() => updateProductStock(product.id, amt)}
                                className="px-2 py-1 bg-stone-100 hover:bg-amber-100 hover:text-amber-900 text-stone-700 font-semibold rounded text-[11px] transition-colors cursor-pointer"
                                title={`Add ${amt} ${product.baseUnit}`}
                              >
                                +{amt}
                              </button>
                            ))}
                          </div>
                        </td>

                        {/* Edit & Delete */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-stone-100 rounded cursor-pointer"
                              title="Edit price & details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(isTa ? `"${product.nameEn}" நீக்கவா?` : `Delete product "${product.nameEn}"?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-stone-100 rounded cursor-pointer"
                              title="Delete product"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHOP SETTINGS */}
      {dashboardTab === 'settings' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs max-w-3xl space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-base font-bold text-stone-900">
              {isTa ? 'கடை விவரங்கள் மற்றும் டெலிவரி அமைப்புகள்' : 'Store Information & Local Delivery Settings'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isTa ? 'வாடிக்கையாளரின் ரசீது மற்றும் இணையதளத்தில் தெரியும் விவரங்கள்.' : 'Details shown to local customers on web & printed bills.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store Name (English)</label>
              <input
                type="text"
                value={shopSettings.shopNameEn}
                onChange={(e) => updateShopSettings({ shopNameEn: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">கடை பெயர் (தமிழ்)</label>
              <input
                type="text"
                value={shopSettings.shopNameTa}
                onChange={(e) => updateShopSettings({ shopNameTa: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Phone Number (Orders)</label>
              <input
                type="text"
                value={shopSettings.phone}
                onChange={(e) => updateShopSettings({ phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">WhatsApp Number (e.g. 919842155678)</label>
              <input
                type="text"
                value={shopSettings.whatsappPhone}
                onChange={(e) => updateShopSettings({ whatsappPhone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Shop UPI ID (GPay / PhonePe)</label>
              <input
                type="text"
                value={shopSettings.upiId}
                onChange={(e) => updateShopSettings({ upiId: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Free Delivery Min Order (₹)</label>
              <input
                type="number"
                value={shopSettings.freeDeliveryThreshold}
                onChange={(e) => updateShopSettings({ freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={shopSettings.deliveryCharge}
                onChange={(e) => updateShopSettings({ deliveryCharge: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Town / Bazaar Area</label>
              <input
                type="text"
                value={shopSettings.townName}
                onChange={(e) => updateShopSettings({ townName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">Full Shop Address (English)</label>
              <input
                type="text"
                value={shopSettings.addressEn}
                onChange={(e) => updateShopSettings({ addressEn: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-stone-700 block mb-1">கடை முழு முகவரி (தமிழ்)</label>
              <input
                type="text"
                value={shopSettings.addressTa}
                onChange={(e) => updateShopSettings({ addressTa: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANDI / WHOLESALE REORDER LIST */}
      {isReorderModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-base">
                  {isTa ? 'மண்டி மொத்த கொள்முதல் பட்டியல்' : 'Wholesale Mandi Reorder Sheet'}
                </h3>
              </div>
              <button onClick={() => setIsReorderModalOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {isTa 
                ? 'உங்கள் கடையில் குறைந்த அளவில் உள்ள பொருட்கள் தானாகவே தொகுக்கப்பட்டுள்ளன. இதை காப்பி செய்து உங்கள் மொத்த வியாபாரிக்கு வாட்ஸ்அப் செய்யலாம்.' 
                : 'Below items are currently at or below minimum threshold. Copy and send directly to your wholesale distributor or grain mandi supplier.'}
            </p>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 font-mono text-xs max-h-60 overflow-y-auto space-y-1">
              {lowStockProducts.length === 0 ? (
                <p className="text-stone-400 font-sans text-center py-4">
                  {isTa ? 'அனைத்து சரக்குகளும் போதுமான அளவில் உள்ளன!' : 'All items are currently well-stocked!'}
                </p>
              ) : (
                lowStockProducts.map((p, idx) => (
                  <div key={p.id} className="flex justify-between py-1 border-b border-stone-100 last:border-0">
                    <span>{idx + 1}. {p.nameEn} ({p.nameTa})</span>
                    <span className="font-bold text-amber-800">
                      {p.currentStock} {p.baseUnit} (min: {p.minStockThreshold})
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsReorderModalOpen(false)}
                className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Close
              </button>
              {lowStockProducts.length > 0 && (
                <button
                  onClick={handleCopyReorderList}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedReorder ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedReorder ? 'Copied to Clipboard!' : 'Copy List for Mandi'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                {isTa ? 'புதிய பொருள் சேர்த்தல்' : 'Add New Provision to Store'}
              </h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Item Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newProdNameEn}
                    onChange={(e) => setNewProdNameEn(e.target.value)}
                    placeholder="e.g. Sona Masoori Raw Rice"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">பொருள் பெயர் (தமிழ்) *</label>
                  <input
                    type="text"
                    required
                    value={newProdNameTa}
                    onChange={(e) => setNewProdNameTa(e.target.value)}
                    placeholder="எ.கா: சோனா மசூரி பச்சரிசி"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="rice_grains">Rice & Grains</option>
                    <option value="dals_pulses">Dals & Pulses</option>
                    <option value="spices_masala">Spices & Masala</option>
                    <option value="oils_ghee">Oils & Ghee</option>
                    <option value="daily_essentials">Daily Essentials</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Base Unit</label>
                  <select
                    value={newProdBaseUnit}
                    onChange={(e) => setNewProdBaseUnit(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="L">Liter (L)</option>
                    <option value="g">Gram (g)</option>
                    <option value="pack">Packet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Price per Unit (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    required
                    value={newProdThreshold}
                    onChange={(e) => setNewProdThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Photo Selection</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { path: '/src/assets/images/product_rice_grains_1791049147721.jpg', label: 'Grains' },
                    { path: '/src/assets/images/product_spices_masala_1791049162137.jpg', label: 'Spices/Dal' },
                    { path: '/src/assets/images/product_cooking_oils_1791049174877.jpg', label: 'Oils' },
                    { path: '/src/assets/images/hero_grocery_store_1791049131252.jpg', label: 'Store' },
                  ].map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewProdImage(img.path)}
                      className={`p-1 rounded-lg border text-center transition-all cursor-pointer ${
                        newProdImage === img.path ? 'border-amber-700 ring-2 ring-amber-600' : 'border-stone-200'
                      }`}
                    >
                      <img src={img.path} alt={img.label} className="w-full h-12 object-cover rounded" />
                      <span className="text-[10px] block mt-0.5">{img.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3 py-2 text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg cursor-pointer shadow-xs"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">
                Edit {editingProduct.nameEn}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Base Price per {editingProduct.baseUnit} (₹)</label>
                <input
                  type="number"
                  value={editingProduct.basePrice}
                  onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Current Stock ({editingProduct.baseUnit})</label>
                <input
                  type="number"
                  value={editingProduct.currentStock}
                  onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Reorder Alert Threshold ({editingProduct.baseUnit})</label>
                <input
                  type="number"
                  value={editingProduct.minStockThreshold}
                  onChange={(e) => setEditingProduct({ ...editingProduct, minStockThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-2 text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

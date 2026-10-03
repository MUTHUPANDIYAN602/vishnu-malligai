import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, ProductVariant } from '../types';
import { Search, ShoppingBag, Phone, Check, AlertCircle, Plus, Minus, ArrowRight, ShieldCheck, Clock, Truck, Sparkles } from 'lucide-react';

export const CustomerStorefront: React.FC = () => {
  const { 
    products, 
    language, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    addToCart,
    cart,
    shopSettings,
    setActiveView,
    setIsCartOpen
  } = useStore();

  const isTa = language === 'ta';

  // Map of selected variant per product { [productId]: variantId }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const getActiveVariant = (product: Product): ProductVariant => {
    const variantId = selectedVariants[product.id];
    if (variantId) {
      const match = product.variants.find(v => v.id === variantId);
      if (match) return match;
    }
    return product.variants[0];
  };

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variantId }));
  };

  const handleAddToCart = (product: Product) => {
    const variant = getActiveVariant(product);
    addToCart(product, variant, 1);
    setAddedAnimationId(product.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      product.nameEn.toLowerCase().includes(q) ||
      product.nameTa.toLowerCase().includes(q) ||
      product.descriptionEn.toLowerCase().includes(q) ||
      product.descriptionTa.toLowerCase().includes(q)
    );
  });

  const categories: { id: ProductCategory; labelEn: string; labelTa: string }[] = [
    { id: 'all', labelEn: 'All Groceries', labelTa: 'அனைத்து பொருட்கள்' },
    { id: 'rice_grains', labelEn: 'Rice & Grains', labelTa: 'அரிசி & தானியங்கள்' },
    { id: 'dals_pulses', labelEn: 'Dals & Pulses', labelTa: 'பருப்பு வகைகள்' },
    { id: 'spices_masala', labelEn: 'Spices & Masala', labelTa: 'மசாலா வகைகள்' },
    { id: 'oils_ghee', labelEn: 'Cooking Oils & Ghee', labelTa: 'எண்ணெய் & நெய்' },
    { id: 'daily_essentials', labelEn: 'Daily Essentials', labelTa: 'அன்றாட தேவைகள்' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Notice Banner: 1 slim bar */}
      <section className="bg-amber-900 text-amber-50 text-xs py-2 px-4 text-center font-medium">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span>
            {isTa 
              ? `₹${shopSettings.freeDeliveryThreshold}க்கு மேல் ஆர்டர் செய்தால் உள்ளூர் இலவச டெலிவரி!` 
              : `Free Local Town Delivery on orders above ₹${shopSettings.freeDeliveryThreshold}!`}
          </span>
          <span className="hidden sm:inline text-amber-300">·</span>
          <span>
            {isTa ? '2 மணி நேரத்தில் வீட்டு வாசலில் டெலிவரி' : 'Express Delivery within 2 Hours in Town'}
          </span>
          <span className="hidden sm:inline text-amber-300">·</span>
          <a href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`} className="underline font-semibold hover:text-white">
            {isTa ? `தொலைபேசி ஆர்டர்: ${shopSettings.phone}` : `Call to Order: ${shopSettings.phone}`}
          </a>
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 text-white min-h-[340px] sm:min-h-[380px] flex items-center shadow-md">
          {/* Background Image with Measured Contrast Scrim */}
          <img 
            src="/src/assets/images/hero_grocery_store_1791049131252.jpg" 
            alt="Vishnu Malligai Storefront"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl px-6 sm:px-12 py-10 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
              <span>{shopSettings.townName}</span>
              <span aria-hidden="true">·</span>
              <span>{isTa ? 'நம்பிக்கையான மளிகைக் கடை' : 'Trusted Local Provisions Since 1998'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {isTa ? 'சுத்தமான தரமான மளிகை பொருட்கள் உங்கள் இல்லம் தேடி' : 'Pure, Fresh & Handpicked Groceries for Your Family'}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {isTa
                ? 'முதல் தரம் பொன்னி அரிசி, பருப்பு வகைகள், மரச்செக்கு எண்ணெய் மற்றும் பாரம்பரிய மசாலா தூள்கள் சரியான எடையில் நியாயமான விலையில்.'
                : 'Premium aged Ponni rice, unpolished pulses, wood cold-pressed oils, and farm-fresh spices at honest wholesale-retail prices.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-sm whitespace-nowrap"
              >
                {isTa ? 'பொருட்களைப் பார்க்க' : 'Browse Catalog'}
              </button>

              <button 
                onClick={() => setActiveView('quick_list')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-medium rounded-lg transition-colors cursor-pointer backdrop-blur-xs flex items-center gap-2 whitespace-nowrap"
              >
                <span>{isTa ? 'பட்டியல் வழியில் ஆர்டர்' : 'Quick Grocery List'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 px-6 bg-white border border-stone-200 rounded-xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{isTa ? 'விரைவு டெலிவரி' : 'Fast Town Delivery'}</p>
              <p className="text-[11px] text-stone-500">{isTa ? '2 மணி நேரத்தில்' : 'Within 2 hours'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{isTa ? 'சுத்தமான தரம்' : '100% Pure & Clean'}</p>
              <p className="text-[11px] text-stone-500">{isTa ? 'கலப்படமற்ற பொருட்கள்' : 'Zero adulteration'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{isTa ? 'கடை நேரம்' : 'Shop Timings'}</p>
              <p className="text-[11px] text-stone-500">{shopSettings.openingHoursEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900">{isTa ? 'வாட்ஸ்அப் ஆர்டர்' : 'WhatsApp Order'}</p>
              <p className="text-[11px] text-stone-500">{shopSettings.phone}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Search Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Search Bar & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              {isTa ? 'மளிகைப் பொருட்கள் வரிசை' : 'Provisions & Grocery Catalog'}
            </h2>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
              <span>{filteredProducts.length} {isTa ? 'பொருட்கள் கிடைக்கின்றன' : 'products available'}</span>
              <span aria-hidden="true">·</span>
              <span>{isTa ? 'நேரடி ஸ்டாக் இருப்பு' : 'Real-time Town Stock'}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? 'அரிசி, பருப்பு, எண்ணெய் தேடவும்...' : 'Search rice, dal, oil, spices...'}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-shadow"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs (Interactive Segmented Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {isTa ? cat.labelTa : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-base font-semibold text-stone-800">
              {isTa ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No items found matching your search'}
            </p>
            <p className="text-xs text-stone-500">
              {isTa 
                ? 'வேறொரு பெயர் கொடுத்து தேடவும் அல்லது வகைகளை மாற்றவும்.' 
                : 'Try searching for rice, toor dal, gingelly oil, or reset category filter.'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="px-4 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-md cursor-pointer"
            >
              {isTa ? 'அனைத்து பொருட்களையும் காட்டு' : 'Reset Search'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const activeVariant = getActiveVariant(product);
              const variantPrice = Math.round(product.basePrice * activeVariant.multiplier);
              const isLowStock = product.currentStock <= product.minStockThreshold && product.currentStock > 0;
              const isOutOfStock = product.currentStock <= 0;

              // Check if already in cart
              const inCartItem = cart.find(
                item => item.productId === product.id && item.variantId === activeVariant.id
              );

              return (
                <div 
                  key={product.id}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
                >
                  {/* Image Container with Fallback */}
                  <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.nameEn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    
                    {/* Stock Status Indicator - Quiet text label, no gaudy pills */}
                    <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-sm">
                      {isOutOfStock ? (
                        <span className="text-red-300 font-semibold">{isTa ? 'இருப்பு இல்லை' : 'Out of Stock'}</span>
                      ) : isLowStock ? (
                        <span className="text-amber-300">{isTa ? `குறைந்த இருப்பு (${product.currentStock} ${product.baseUnit})` : `Low Stock (${product.currentStock} ${product.baseUnit} left)`}</span>
                      ) : (
                        <span>{isTa ? `இருப்பு: ${product.currentStock} ${product.baseUnit}` : `In Stock: ${product.currentStock} ${product.baseUnit}`}</span>
                      )}
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      {/* Unboxed category metadata */}
                      <div className="text-[11px] font-medium text-amber-800 tracking-wide">
                        {product.category === 'rice_grains' && (isTa ? 'அரிசி வகை' : 'Rice & Grains')}
                        {product.category === 'dals_pulses' && (isTa ? 'பருப்பு வகை' : 'Dals & Pulses')}
                        {product.category === 'spices_masala' && (isTa ? 'மசாலா & தூள்' : 'Spices & Masala')}
                        {product.category === 'oils_ghee' && (isTa ? 'எண்ணெய் வகை' : 'Oils & Ghee')}
                        {product.category === 'daily_essentials' && (isTa ? 'அன்றாட தேவை' : 'Daily Essentials')}
                      </div>

                      {/* Primary Titles */}
                      <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-1">
                        {isTa ? product.nameTa : product.nameEn}
                      </h3>
                      <p className="text-xs text-stone-500 line-clamp-1">
                        {isTa ? product.nameEn : product.nameTa}
                      </p>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {isTa ? product.descriptionTa : product.descriptionEn}
                    </p>

                    {/* Variant Selector */}
                    {product.variants.length > 1 && (
                      <div className="pt-1">
                        <label className="text-[11px] font-medium text-stone-500 block mb-1">
                          {isTa ? 'அளவு / எடை தேர்வு:' : 'Select Pack Size:'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                          {product.variants.map(v => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleVariantChange(product.id, v.id)}
                              className={`py-1 px-1.5 text-[11px] font-medium rounded-sm border transition-colors cursor-pointer truncate ${
                                activeVariant.id === v.id
                                  ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                                  : 'border-stone-200 text-stone-600 hover:border-stone-300'
                              }`}
                            >
                              {isTa ? v.labelTa : v.labelEn}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Price and Add to Cart Row */}
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-lg font-bold text-stone-900 tabular-nums leading-none">
                          ₹{variantPrice}
                        </div>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {isTa ? activeVariant.labelTa : activeVariant.labelEn}
                        </span>
                      </div>

                      {isOutOfStock ? (
                        <button 
                          disabled
                          className="px-3 py-1.5 text-xs font-medium text-stone-400 bg-stone-100 rounded-lg cursor-not-allowed"
                        >
                          {isTa ? 'தீர்ந்துவிட்டது' : 'Unavailable'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-xs active:scale-95 ${
                            addedAnimationId === product.id
                              ? 'bg-emerald-700 text-white'
                              : 'bg-amber-700 hover:bg-amber-800 text-white'
                          }`}
                        >
                          {addedAnimationId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{isTa ? 'சேர்க்கப்பட்டது' : 'Added!'}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{isTa ? 'சேர்' : 'Add to Cart'}</span>
                              {inCartItem && (
                                <span className="bg-amber-950/40 text-[10px] px-1.5 rounded-full tabular-nums">
                                  {inCartItem.quantity}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Quick Cart on Mobile if items exist */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-amber-800 text-white p-3 rounded-xl shadow-lg flex items-center justify-between font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cart.length} {isTa ? 'வகைகள்' : 'items'} in cart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold tabular-nums">
                ₹{cart.reduce((t, i) => t + (i.unitPrice * i.quantity), 0)}
              </span>
              <span className="text-xs bg-amber-900/60 px-2 py-0.5 rounded-sm">
                {isTa ? 'பார்க்க →' : 'View →'}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

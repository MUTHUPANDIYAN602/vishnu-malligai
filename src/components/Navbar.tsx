import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, Search, ClipboardList, LayoutDashboard, Truck, Globe, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    activeView, 
    setActiveView, 
    cartItemCount, 
    setIsCartOpen,
    lowStockProducts,
    orders
  } = useStore();

  const isTa = language === 'ta';
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top 3-Zone Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single element wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveView('storefront')}
            className="flex items-center gap-2 text-left group cursor-pointer focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center font-bold text-lg shadow-inner">
              V
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors block leading-tight">
                Vishnu Malligai
              </span>
              <span className="text-[11px] font-medium text-amber-900/70 block leading-none">
                விஷ்ணு மளிகை · Provisions
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
          <button
            onClick={() => setActiveView('storefront')}
            className={`cursor-pointer transition-colors py-1 ${
              activeView === 'storefront' 
                ? 'text-amber-800 font-semibold border-b-2 border-amber-800' 
                : 'hover:text-stone-900'
            }`}
          >
            {isTa ? 'கடை / பொருட்கள்' : 'Store Catalog'}
          </button>

          <button
            onClick={() => setActiveView('quick_list')}
            className={`cursor-pointer flex items-center gap-1.5 transition-colors py-1 ${
              activeView === 'quick_list' 
                ? 'text-amber-800 font-semibold border-b-2 border-amber-800' 
                : 'hover:text-stone-900'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-amber-700" />
            <span>{isTa ? 'பட்டியல் ஆர்டர்' : 'Quick Grocery List'}</span>
          </button>

          <button
            onClick={() => setActiveView('tracking')}
            className={`cursor-pointer flex items-center gap-1.5 transition-colors py-1 ${
              activeView === 'tracking' 
                ? 'text-amber-800 font-semibold border-b-2 border-amber-800' 
                : 'hover:text-stone-900'
            }`}
          >
            <Truck className="w-4 h-4 text-stone-500" />
            <span>{isTa ? 'ஆர்டர் நிலை' : 'Track Order'}</span>
          </button>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`cursor-pointer flex items-center gap-1.5 transition-colors py-1 ${
              activeView === 'dashboard' 
                ? 'text-amber-800 font-semibold border-b-2 border-amber-800' 
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-amber-800" />
            <span>{isTa ? 'உரிமையாளர் பலகை' : 'Owner Dashboard'}</span>
            {pendingOrdersCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse" title="New pending orders" />
            )}
          </button>
        </nav>

        {/* Zone 3: Primary action controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors cursor-pointer"
            title="Switch Language / மொழியை மாற்ற"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Owner Dashboard quick toggle button for mobile or direct access */}
          <button
            onClick={() => setActiveView(activeView === 'dashboard' ? 'storefront' : 'dashboard')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                : 'bg-stone-800 text-stone-100 hover:bg-stone-900'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{activeView === 'dashboard' ? (isTa ? 'கடையைப் பார்' : 'View Store') : (isTa ? 'கடை டாஷ்போர்டு' : 'Shop Dashboard')}</span>
            {pendingOrdersCount > 0 && activeView !== 'dashboard' && (
              <span className="bg-red-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">
              {isTa ? 'பை' : 'Cart'}
            </span>
            <span className="bg-amber-950/60 text-white text-xs px-2 py-0.5 rounded-full font-bold tabular-nums">
              {cartItemCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Sub-Bar for Quick Access */}
      <div className="flex md:hidden items-center justify-around border-t border-stone-200 py-2 bg-stone-50 text-xs font-medium text-stone-700">
        <button 
          onClick={() => setActiveView('storefront')}
          className={`px-3 py-1 rounded-sm ${activeView === 'storefront' ? 'text-amber-800 font-bold bg-amber-50' : ''}`}
        >
          {isTa ? 'பொருட்கள்' : 'Store'}
        </button>
        <button 
          onClick={() => setActiveView('quick_list')}
          className={`px-3 py-1 rounded-sm flex items-center gap-1 ${activeView === 'quick_list' ? 'text-amber-800 font-bold bg-amber-50' : ''}`}
        >
          <ClipboardList className="w-3.5 h-3.5 text-amber-700" />
          {isTa ? 'பட்டியல்' : 'Quick List'}
        </button>
        <button 
          onClick={() => setActiveView('tracking')}
          className={`px-3 py-1 rounded-sm flex items-center gap-1 ${activeView === 'tracking' ? 'text-amber-800 font-bold bg-amber-50' : ''}`}
        >
          <Truck className="w-3.5 h-3.5" />
          {isTa ? 'ஆர்டர் நிலை' : 'Track'}
        </button>
        <button 
          onClick={() => setActiveView('dashboard')}
          className={`px-3 py-1 rounded-sm flex items-center gap-1 ${activeView === 'dashboard' ? 'text-amber-800 font-bold bg-amber-50' : ''}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-stone-700" />
          {isTa ? 'நிர்வாகம்' : 'Dashboard'}
          {pendingOrdersCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
          )}
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { useStore } from '../context/StoreContext';
import { Phone, MapPin, Clock, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { shopSettings, language, setActiveView } = useStore();
  const isTa = language === 'ta';

  return (
    <footer className="no-print bg-stone-900 text-stone-300 text-xs border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-700 text-white font-bold flex items-center justify-center text-sm">
                V
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {shopSettings.shopNameEn}
              </span>
            </div>
            <p className="text-stone-400 text-xs leading-relaxed">
              {isTa ? shopSettings.taglineTa : shopSettings.taglineEn}
            </p>
            <div className="flex items-center gap-2 text-stone-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{isTa ? '100% தூய மளிகைப் பொருட்கள்' : 'Direct farm-source & clean grains'}</span>
            </div>
          </div>

          {/* Col 2: Store Timings & Delivery */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              {isTa ? 'கடை இயங்கும் நேரம்' : 'Shop Hours & Delivery'}
            </h4>
            <div className="flex items-start gap-2 text-stone-400">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{isTa ? shopSettings.openingHoursTa : shopSettings.openingHoursEn}</span>
            </div>
            <p className="text-stone-400 pt-1">
              {isTa 
                ? `₹${shopSettings.freeDeliveryThreshold}க்கு மேல் இலவச டெலிவரி. உள்ளூர் டெலிவரி கட்டணம் ₹${shopSettings.deliveryCharge}.` 
                : `Free local delivery above ₹${shopSettings.freeDeliveryThreshold}. Local town rate: ₹${shopSettings.deliveryCharge}.`}
            </p>
          </div>

          {/* Col 3: Address & Phone */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              {isTa ? 'தொடர்பு & முகவரி' : 'Contact & Address'}
            </h4>
            <div className="flex items-start gap-2 text-stone-400">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{isTa ? shopSettings.addressTa : shopSettings.addressEn}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-stone-300">
              <Phone className="w-4 h-4 text-amber-500" />
              <a href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`} className="hover:text-white">
                {shopSettings.phone}
              </a>
            </div>
          </div>

          {/* Col 4: Quick Navigation & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">
              {isTa ? 'விரைவு வழிகள்' : 'Quick Actions'}
            </h4>
            <div className="flex flex-col space-y-1.5 text-stone-400">
              <button 
                onClick={() => setActiveView('storefront')} 
                className="text-left hover:text-white cursor-pointer transition-colors"
              >
                {isTa ? 'பொருட்கள் பட்டியல்' : 'Store Catalog'}
              </button>
              <button 
                onClick={() => setActiveView('quick_list')} 
                className="text-left hover:text-white cursor-pointer transition-colors"
              >
                {isTa ? 'பட்டியல் வழியில் ஆர்டர்' : 'Quick Grocery List'}
              </button>
              <button 
                onClick={() => setActiveView('tracking')} 
                className="text-left hover:text-white cursor-pointer transition-colors"
              >
                {isTa ? 'ஆர்டர் நிலை அறிதல்' : 'Track Order'}
              </button>
              <button 
                onClick={() => setActiveView('dashboard')} 
                className="text-left text-amber-400 hover:text-amber-300 font-semibold cursor-pointer transition-colors"
              >
                {isTa ? 'உரிமையாளர் டாஷ்போர்டு' : 'Shopkeeper Dashboard'}
              </button>
            </div>
          </div>

        </div>

        {/* Quiet Bottom Copyright */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <p>© {new Date().getFullYear()} {shopSettings.shopNameEn} · All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Serving our town community with trust & pride</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

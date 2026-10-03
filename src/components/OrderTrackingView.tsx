import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ArrowLeft,
  FileText
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { 
    orders, 
    language, 
    shopSettings, 
    trackedOrderPhoneOrId, 
    setTrackedOrderPhoneOrId,
    setSelectedOrderForReceipt,
    setActiveView
  } = useStore();

  const isTa = language === 'ta';
  const [searchInput, setSearchInput] = useState(trackedOrderPhoneOrId || '');

  // Search logic: by phone or order ID
  const matchedOrders = orders.filter(o => {
    if (!searchInput.trim()) return false;
    const term = searchInput.trim().toLowerCase();
    const cleanPhone = o.customerPhone.replace(/\D/g, '');
    const cleanTerm = term.replace(/\D/g, '');
    return (
      o.id.toLowerCase() === term ||
      o.id.toLowerCase().includes(term) ||
      (cleanTerm.length >= 4 && cleanPhone.includes(cleanTerm))
    );
  });

  // Default to showing latest order if none searched yet
  const displayedOrder = matchedOrders.length > 0 ? matchedOrders[0] : (orders.length > 0 && trackedOrderPhoneOrId ? orders.find(o => o.id === trackedOrderPhoneOrId) : null);

  const getStepProgress = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'packed': return 2;
      case 'out_for_delivery': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <button 
            onClick={() => setActiveView('storefront')}
            className="inline-flex items-center gap-1 text-xs text-amber-800 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isTa ? '← கடைக்குத் திரும்பு' : '← Back to store'}</span>
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {isTa ? 'உங்கள் மளிகை ஆர்டர் நிலை' : 'Track Your Grocery Order'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {isTa 
              ? 'உங்கள் 10 இலக்க செல்போன் எண் அல்லது ஆர்டர் எண் (எ.கா: VM-1082) உள்ளிட்டு பார்க்கவும்.' 
              : 'Enter your 10-digit mobile number or Order ID (e.g. VM-1082) to track live status.'}
          </p>
        </div>

        {/* Quick Call Store */}
        <a 
          href={`tel:${shopSettings.phone.replace(/\s+/g, '')}`}
          className="inline-flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors shrink-0"
        >
          <Phone className="w-3.5 h-3.5 text-amber-800" />
          <span>{isTa ? `கடைக்கு அழைக்க: ${shopSettings.phone}` : `Call Shop: ${shopSettings.phone}`}</span>
        </a>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setTrackedOrderPhoneOrId(searchInput);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isTa ? 'செல்போன் எண் அல்லது ஆர்டர் எண் உள்ளிடவும்...' : 'Enter Phone Number or Order ID (e.g. 9842112345 or VM-1082)'}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            {isTa ? 'நிலையைத் தேடு' : 'Track Order'}
          </button>
        </form>

        {/* Quick Suggestions from existing orders */}
        {orders.length > 0 && !searchInput && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
            <span>{isTa ? 'சமீபத்திய ஆர்டர்கள்:' : 'Recent Orders:'}</span>
            {orders.slice(0, 3).map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchInput(o.id);
                  setTrackedOrderPhoneOrId(o.id);
                }}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-mono cursor-pointer"
              >
                {o.id} ({o.customerName})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tracked Order Details Card */}
      {displayedOrder ? (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-6">
          
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-stone-900 bg-amber-50 text-amber-900 px-2.5 py-0.5 rounded border border-amber-200">
                  #{displayedOrder.id}
                </span>
                <span className="text-xs text-stone-500">
                  {new Date(displayedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(displayedOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                {isTa ? 'வாடிக்கையாளர்:' : 'Customer:'} <strong className="text-stone-900">{displayedOrder.customerName}</strong> ({displayedOrder.customerPhone})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOrderForReceipt(displayedOrder)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isTa ? 'ரசீது பார்க்க' : 'View Bill'}</span>
              </button>

              <a
                href={`https://wa.me/${shopSettings.whatsappPhone}?text=${encodeURIComponent(`Hi Vishnu Malligai, checking on my order #${displayedOrder.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isTa ? 'வாட்ஸ்அப் உதவி' : 'WhatsApp Shop'}</span>
              </a>
            </div>
          </div>

          {/* Progress Stepper Bar */}
          <div className="py-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
              {isTa ? 'ஆர்டர் முன்னேற்றம்' : 'Live Order Progress'}
            </h3>

            {displayedOrder.status === 'cancelled' ? (
              <div className="p-4 bg-stone-100 text-stone-700 rounded-lg text-xs font-semibold text-center">
                {isTa ? 'இந்த ஆர்டர் ரத்து செய்யப்பட்டுள்ளது.' : 'This order has been cancelled.'}
              </div>
            ) : (
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute top-5 left-4 right-4 h-1 bg-stone-200 -z-0">
                  <div 
                    className="h-full bg-amber-700 transition-all duration-500"
                    style={{
                      width: `${((getStepProgress(displayedOrder.status) - 1) / 3) * 100}%`
                    }}
                  />
                </div>

                {/* 4 Steps */}
                <div className="grid grid-cols-4 text-center relative z-10">
                  
                  {/* Step 1: Received */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-xs mb-2">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-bold text-stone-900 leading-tight">
                      {isTa ? 'ஆர்டர் பெறப்பட்டது' : 'Order Placed'}
                    </p>
                    <p className="text-[10px] text-stone-500 hidden sm:block">
                      {isTa ? 'கடையில் பதிவானது' : 'Received by store'}
                    </p>
                  </div>

                  {/* Step 2: Packed */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-2 ${
                      getStepProgress(displayedOrder.status) >= 2 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}>
                      <Package className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-bold leading-tight ${getStepProgress(displayedOrder.status) >= 2 ? 'text-stone-900' : 'text-stone-400'}`}>
                      {isTa ? 'பேக்கிங் முடிந்தது' : 'Packed & Weighed'}
                    </p>
                    <p className="text-[10px] text-stone-500 hidden sm:block">
                      {isTa ? 'மளிகை பொருட்கள் தயார்' : 'Ready at counter'}
                    </p>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-2 ${
                      getStepProgress(displayedOrder.status) >= 3 
                        ? 'bg-amber-700 text-white' 
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}>
                      <Truck className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-bold leading-tight ${getStepProgress(displayedOrder.status) >= 3 ? 'text-stone-900' : 'text-stone-400'}`}>
                      {isTa ? 'டெலிவரியில் உள்ளது' : 'Out for Delivery'}
                    </p>
                    <p className="text-[10px] text-stone-500 hidden sm:block">
                      {isTa ? 'உங்கள் தெரு நோக்கி' : 'On the way to you'}
                    </p>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-xs mb-2 ${
                      getStepProgress(displayedOrder.status) >= 4 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-stone-100 text-stone-400 border border-stone-300'
                    }`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className={`text-xs font-bold leading-tight ${getStepProgress(displayedOrder.status) >= 4 ? 'text-emerald-800' : 'text-stone-400'}`}>
                      {isTa ? 'டெலிவரி முடிந்தது' : 'Delivered'}
                    </p>
                    <p className="text-[10px] text-stone-500 hidden sm:block">
                      {isTa ? 'பொருட்கள் ஒப்படைக்கப்பட்டது' : 'Successfully received'}
                    </p>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Order Details & Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100 text-xs">
            {/* Delivery address & slot */}
            <div className="bg-stone-50 p-3.5 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                {isTa ? 'டெலிவரி முகவரி & நேரம்' : 'Delivery Address & Slot'}
              </span>
              <p className="font-semibold text-stone-900 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>{displayedOrder.deliveryAddress}</span>
              </p>
              {displayedOrder.landmark && (
                <p className="text-stone-500 text-[11px]">Landmark: {displayedOrder.landmark}</p>
              )}
              <p className="text-stone-700 font-medium pt-1">
                {isTa ? 'தேர்ந்தெடுத்த நேரம்:' : 'Delivery Slot:'} <span className="font-bold text-stone-900">{displayedOrder.deliverySlot}</span>
              </p>
            </div>

            {/* Payment Summary */}
            <div className="bg-stone-50 p-3.5 rounded-lg space-y-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                {isTa ? 'கட்டணம் விபரம்' : 'Payment Summary'}
              </span>
              <div className="flex justify-between pt-1">
                <span className="text-stone-600">{isTa ? 'பொருட்கள் மொத்தம்:' : 'Item Subtotal:'}</span>
                <span className="font-semibold text-stone-900 tabular-nums">₹{displayedOrder.itemTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-600">{isTa ? 'டெலிவரி கட்டணம்:' : 'Delivery Charge:'}</span>
                <span className="font-semibold text-stone-900 tabular-nums">
                  {displayedOrder.deliveryFee === 0 ? 'FREE' : `₹${displayedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1">
                <span>{isTa ? 'மொத்த தொகை:' : 'Total Payable:'}</span>
                <span className="text-sm text-amber-900 tabular-nums">₹{displayedOrder.totalAmount}</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                {isTa ? 'செலுத்தும் முறை:' : 'Payment Mode:'} {displayedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI Transfer'} ({displayedOrder.paymentStatus.toUpperCase()})
              </p>
            </div>
          </div>

          {/* Items breakdown list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              {isTa ? 'ஆர்டர் செய்யப்பட்ட பொருட்கள்:' : 'Ordered Provisions:'}
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
              {displayedOrder.items.map((item, i) => (
                <div key={i} className="p-3 bg-white flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-stone-900">
                      {isTa ? item.productNameTa : item.productNameEn}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      {item.variantLabelEn} · ₹{item.unitPrice} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-stone-900 tabular-nums">
                    ₹{item.subtotal}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="py-12 text-center bg-white border border-stone-200 rounded-xl p-8 space-y-2">
          <Truck className="w-10 h-10 text-stone-300 mx-auto" />
          <p className="text-sm font-semibold text-stone-700">
            {isTa ? 'உங்கள் செல்போன் எண் அல்லது ஆர்டர் எண்ணை உள்ளிடவும்' : 'Enter phone number or order ID above to view live status'}
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {isTa 
              ? 'உங்கள் ஆர்டர் எந்த நிலையில் உள்ளது என்பதை எப்போது வேண்டுமானாலும் இந்த பக்கத்தில் பார்க்கலாம்.' 
              : 'Track package preparation, packing, and courier arrival in real-time.'}
          </p>
        </div>
      )}

    </div>
  );
};

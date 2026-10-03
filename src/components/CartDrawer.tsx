import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PaymentMethod, DeliveryType } from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Store, 
  QrCode, 
  Banknote, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal, 
    shopSettings,
    language,
    placeOrder,
    setActiveView,
    setSelectedOrderForReceipt
  } = useStore();

  const isTa = language === 'ta';

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('Morning 8:00 AM - 11:00 AM');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const deliveryFee = deliveryType === 'pickup' 
    ? 0 
    : (cartSubtotal >= shopSettings.freeDeliveryThreshold ? 0 : shopSettings.deliveryCharge);
  const totalAmount = cartSubtotal + deliveryFee;

  const deliverySlots = [
    { id: 'Morning 8:00 AM - 11:00 AM', labelEn: 'Morning (8:00 AM - 11:00 AM)', labelTa: 'காலை (8:00 - 11:00)' },
    { id: 'Afternoon 12:00 PM - 3:00 PM', labelEn: 'Afternoon (12:00 PM - 3:00 PM)', labelTa: 'மதியம் (12:00 - 3:00)' },
    { id: 'Evening 5:00 PM - 8:00 PM', labelEn: 'Evening (5:00 PM - 8:00 PM)', labelTa: 'மாலை (5:00 - 8:00)' },
    { id: 'Immediate Express Pickup (30 Mins)', labelEn: 'Express Pickup in 30 Mins', labelTa: 'விரைவு பிக்அப் (30 நிமிடத்தில்)' },
  ];

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (cart.length === 0) {
      setFormError(isTa ? 'உங்கள் ஷாப்பிங் பை காலியாக உள்ளது' : 'Your cart is empty');
      return;
    }

    if (!customerName.trim()) {
      setFormError(isTa ? 'தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்' : 'Please enter customer name');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError(isTa ? 'சரியான 10 இலக்க செல்போன் எண்ணை உள்ளிடவும்' : 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      setFormError(isTa ? 'தயவுசெய்து உங்கள் தெரு / வீட்டு முகவரியை உள்ளிடவும்' : 'Please enter your delivery street address');
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrder = placeOrder({
        customerName,
        customerPhone: cleanPhone,
        deliveryType,
        deliveryAddress: deliveryType === 'pickup' ? 'Shop Counter Pickup' : deliveryAddress,
        landmark,
        deliverySlot,
        paymentMethod,
        notes,
      });

      setIsSubmitting(false);
      setIsCartOpen(false);
      setSelectedOrderForReceipt(newOrder);
      setActiveView('tracking');
    } catch {
      setIsSubmitting(false);
      setFormError(isTa ? 'ஆர்டர் செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'Error placing order. Please try again.');
    }
  };

  // WhatsApp formatted order string
  const generateWhatsAppUrl = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    let text = `*New Grocery Order - Vishnu Malligai*\n\n`;
    text += `*Customer:* ${customerName.trim() || 'Local Customer'}\n`;
    text += `*Phone:* ${cleanPhone || 'Not provided'}\n`;
    text += `*Delivery Type:* ${deliveryType === 'delivery' ? 'Home Delivery' : 'Shop Pickup'}\n`;
    if (deliveryType === 'delivery') {
      text += `*Address:* ${deliveryAddress.trim()} ${landmark ? `(Landmark: ${landmark})` : ''}\n`;
    }
    text += `*Slot:* ${deliverySlot}\n\n`;
    text += `*Order Items:*\n`;
    cart.forEach((item, idx) => {
      text += `${idx + 1}. ${item.productNameEn} (${item.variantLabelEn}) × ${item.quantity} = ₹${item.unitPrice * item.quantity}\n`;
    });
    text += `\n*Item Total:* ₹${cartSubtotal}\n`;
    text += `*Delivery Fee:* ₹${deliveryFee}\n`;
    text += `*Total Amount:* ₹${totalAmount}\n`;
    text += `*Payment:* ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'UPI Transfer'}\n`;
    if (notes.trim()) {
      text += `*Notes:* ${notes.trim()}\n`;
    }

    return `https://wa.me/${shopSettings.whatsappPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              <h2 className="text-base font-bold text-stone-900">
                {isTa ? 'ஷாப்பிங் பை & செக்அவுட்' : 'Shopping Cart & Checkout'}
              </h2>
              <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full tabular-nums">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">
                  {isTa ? 'உங்கள் ஷாப்பிங் பை காலியாக உள்ளது' : 'Your cart is currently empty'}
                </p>
                <p className="text-xs text-stone-500">
                  {isTa ? 'பொருட்கள் பக்கத்திலிருந்து மளிகைப் பொருட்களை சேர்க்கவும்.' : 'Add items from the store catalog to proceed.'}
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
                >
                  {isTa ? 'பொருட்களைப் பார்க்க' : 'Start Shopping'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-500 pb-1 border-b border-stone-100">
                  <span>{isTa ? 'தேர்ந்தெடுக்கப்பட்ட பொருட்கள்' : 'Selected Grocery Items'}</span>
                  <button 
                    onClick={clearCart}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    {isTa ? 'அனைத்தையும் நீக்கு' : 'Clear All'}
                  </button>
                </div>

                <div className="divide-y divide-stone-100 space-y-2">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.variantId}`} className="pt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={item.image} 
                          alt={item.productNameEn}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0" 
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {isTa ? item.productNameTa : item.productNameEn}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            {isTa ? item.variantLabelTa : item.variantLabelEn} · ₹{item.unitPrice}
                          </p>
                        </div>
                      </div>

                      {/* Stepper & Price */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.variantId, item.quantity - 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-stone-800 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.productId, item.variantId, item.quantity + 1)}
                            className="p-1 text-stone-600 hover:text-stone-900 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-14 text-right">
                          <span className="text-xs font-bold text-stone-900 tabular-nums">
                            ₹{item.unitPrice * item.quantity}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-stone-400 hover:text-red-600 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Free Delivery Bar */}
                <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <span>
                      {cartSubtotal >= shopSettings.freeDeliveryThreshold
                        ? (isTa ? 'இலவச டெலிவரி தகுதி பெற்றது!' : 'Eligible for Free Town Delivery!')
                        : (isTa 
                            ? `இன்னும் ₹${shopSettings.freeDeliveryThreshold - cartSubtotal} சேர்த்தால் இலவச டெலிவரி` 
                            : `Add ₹${shopSettings.freeDeliveryThreshold - cartSubtotal} more for Free Delivery`)}
                    </span>
                  </div>
                  <span className="font-bold tabular-nums">
                    {deliveryFee === 0 ? (isTa ? 'இலவசம்' : 'FREE') : `₹${deliveryFee}`}
                  </span>
                </div>

                {/* Customer Checkout Form */}
                <form id="checkout-form" onSubmit={handlePlaceOrder} className="pt-4 border-t border-stone-200 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    {isTa ? 'டெலிவரி & வாடிக்கையாளர் விவரங்கள்' : 'Delivery & Customer Details'}
                  </h3>

                  {formError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Delivery Mode Choice */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('delivery')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        deliveryType === 'delivery'
                          ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>{isTa ? 'வீட்டு டெலிவரி' : 'Home Delivery'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryType('pickup')}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        deliveryType === 'pickup'
                          ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>{isTa ? 'கடைக்கு வந்து பெற' : 'Shop Pickup'}</span>
                    </button>
                  </div>

                  {/* Name & Phone */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        {isTa ? 'உங்கள் பெயர் *' : 'Full Name *'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder={isTa ? 'எ.கா: ராமசாமி' : 'e.g. K. Ramasamy'}
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                        {isTa ? 'செல்போன் எண் (வாட்ஸ்அப் / அழைப்பிற்கு) *' : 'Mobile Number (for Order & WhatsApp) *'}
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="98421 12345"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address fields if delivery */}
                  {deliveryType === 'delivery' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          {isTa ? 'தெரு & கதவு எண் / வீட்டு முகவரி *' : 'Door No, Street & Area Address *'}
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                          <textarea
                            rows={2}
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder={isTa ? 'எ.கா: 12, வடக்கு ரத வீதி, காந்தி நகர்' : 'e.g. 12, West Car Street, Gandhi Nagar'}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                          {isTa ? 'அடையாளக் குறி (Landmark)' : 'Landmark (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          placeholder={isTa ? 'எ.கா: பிள்ளையார் கோவில் அருகில், பச்சை கேட்' : 'e.g. Near Pillaiyar Temple, green gate'}
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Delivery Slot Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      {isTa ? 'விரும்பும் நேரம் (டெலிவரி / பிக்அப்) *' : 'Preferred Time Slot *'}
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      {deliverySlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {isTa ? slot.labelTa : slot.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-stone-700 block">
                      {isTa ? 'பணம் செலுத்தும் முறை *' : 'Payment Method *'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          paymentMethod === 'cod'
                            ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        <span>{isTa ? 'பொருட்கள் பெற்ற பின் பணம் (COD)' : 'Cash on Delivery'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi_qr')}
                        className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                          paymentMethod === 'upi_qr'
                            ? 'border-amber-700 bg-amber-50 text-amber-900 font-bold'
                            : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{isTa ? 'GPay / PhonePe (UPI)' : 'UPI / QR Code'}</span>
                      </button>
                    </div>

                    {/* Interactive UPI preview if UPI selected */}
                    {paymentMethod === 'upi_qr' && (
                      <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2 text-center">
                        <p className="text-[11px] font-medium text-stone-700">
                          {isTa ? 'கடை UPI ஐடிக்கு நேரடியாக செலுத்தலாம்:' : 'Pay directly to Shop UPI ID:'}
                        </p>
                        <div className="inline-block bg-white p-2 rounded border border-stone-300 shadow-2xs font-mono text-xs font-bold text-amber-900">
                          {shopSettings.upiId}
                        </div>
                        <p className="text-[10px] text-stone-500">
                          {isTa 
                            ? `தொகை: ₹${totalAmount} (ஆர்டர் உறுதி செய்யப்பட்டதும் ரசீது காண்பிக்கப்படும்)` 
                            : `Amount: ₹${totalAmount} (Instant bill QR generated on order submission)`}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      {isTa ? 'கடைக்காரருக்கு குறிப்பு (விருப்பப்பட்டால்)' : 'Special Instructions for Shopkeeper (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isTa ? 'எ.கா: நல்லெண்ணெய் கண்ணாடி பாட்டிலில் ஊற்றவும்' : 'e.g. Please pack carefully in cloth bag'}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                    />
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Footer with Summary & Buttons */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>{isTa ? 'பொருட்கள் மொத்தம்' : 'Items Subtotal'}</span>
                  <span className="tabular-nums font-semibold text-stone-800">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{isTa ? 'டெலிவரி கட்டணம்' : 'Delivery Fee'}</span>
                  <span className="tabular-nums font-semibold text-stone-800">
                    {deliveryFee === 0 ? (isTa ? 'இலவசம்' : 'FREE') : `₹${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-200">
                  <span>{isTa ? 'மொத்த தொகை' : 'Final Payable Amount'}</span>
                  <span className="tabular-nums text-base text-amber-800">₹{totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons: 1. Place Web Order, 2. WhatsApp Direct Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-3 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? (isTa ? 'பதிவாகிறது...' : 'Placing Order...') : (isTa ? 'ஆர்டர் உறுதி செய்' : 'Confirm Order')}</span>
                </button>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-center shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isTa ? 'வாட்ஸ்அப் ஆர்டர்' : 'Order via WhatsApp'}</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

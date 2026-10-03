import React from 'react';
import { useStore } from '../context/StoreContext';
import { X, Printer, Check } from 'lucide-react';

export const PrintableReceipt: React.FC = () => {
  const { selectedOrderForReceipt, setSelectedOrderForReceipt, shopSettings, language } = useStore();
  const isTa = language === 'ta';

  if (!selectedOrderForReceipt) return null;

  const order = selectedOrderForReceipt;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col my-8">
        
        {/* Modal Controls (Not printed) */}
        <div className="no-print p-4 bg-stone-100 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-bold text-stone-800">
              {isTa ? 'கடை ரசீது / பில்' : 'Retail Store Bill / Receipt'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isTa ? 'அச்சிடு (Print)' : 'Print'}</span>
            </button>
            <button
              onClick={() => setSelectedOrderForReceipt(null)}
              className="p-1 text-stone-400 hover:text-stone-700 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - Standard 80mm thermal receipt styling */}
        <div id="printable-receipt" className="p-6 font-mono text-xs text-stone-900 space-y-4 bg-white">
          
          {/* Store Header */}
          <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-stone-300">
            <h2 className="text-lg font-bold tracking-wider uppercase font-sans">
              {shopSettings.shopNameEn}
            </h2>
            <p className="text-xs font-sans font-medium text-stone-700">
              {shopSettings.shopNameTa}
            </p>
            <p className="text-[11px] leading-tight text-stone-600 font-sans max-w-xs mx-auto">
              {shopSettings.addressEn}
            </p>
            <p className="text-[11px] text-stone-600 font-sans">
              Phone: {shopSettings.phone}
            </p>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest pt-1">
              ** RETAIL CASH BILL / ESTIMATE **
            </p>
          </div>

          {/* Bill & Customer Meta */}
          <div className="text-[11px] space-y-1 pb-2 border-b border-stone-200">
            <div className="flex justify-between">
              <span>Bill No: <strong>{order.id}</strong></span>
              <span>Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer: {order.customerName}</span>
              <span>Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone: {order.customerPhone}</span>
              <span className="uppercase font-bold">{order.deliveryType}</span>
            </div>
            {order.deliveryType === 'delivery' && (
              <p className="text-[10px] leading-tight text-stone-600 pt-0.5">
                Address: {order.deliveryAddress} {order.landmark && `(Near ${order.landmark})`}
              </p>
            )}
            <p className="text-[10px] text-stone-600">
              Slot: {order.deliverySlot}
            </p>
          </div>

          {/* Items Table */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-bold border-b border-stone-300 pb-1">
              <span className="w-1/2">Item Description</span>
              <span className="w-1/4 text-center">Qty / Wt</span>
              <span className="w-1/4 text-right">Amount (₹)</span>
            </div>

            <div className="divide-y divide-dashed divide-stone-200 space-y-1 pt-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] pt-1">
                  <div className="w-1/2 truncate pr-1">
                    <span className="font-sans font-medium">{item.productNameEn}</span>
                    <span className="block text-[10px] text-stone-500 font-sans">{item.variantLabelEn}</span>
                  </div>
                  <div className="w-1/4 text-center tabular-nums">
                    {item.quantity}
                  </div>
                  <div className="w-1/4 text-right font-bold tabular-nums">
                    {item.subtotal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-2 border-t-2 border-dashed border-stone-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">₹{order.itemTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="tabular-nums">{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-stone-900 border-t border-stone-300 pt-1">
              <span>TOTAL PAYABLE:</span>
              <span className="tabular-nums text-base">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Payment & Footer */}
          <div className="text-center pt-3 border-t border-dashed border-stone-300 space-y-1 font-sans">
            <p className="text-[11px] font-bold uppercase text-stone-800">
              Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : `UPI Paid (${shopSettings.upiId})`}
            </p>
            {order.notes && (
              <p className="text-[10px] italic text-stone-600">
                Customer Note: "{order.notes}"
              </p>
            )}
            <p className="text-xs font-semibold text-stone-900 pt-2">
              நன்றி! மீண்டும் வருக!
            </p>
            <p className="text-[10px] text-stone-500">
              Thank you for shopping at Vishnu Malligai!
            </p>
          </div>

        </div>

        {/* Footer in Modal */}
        <div className="no-print p-4 bg-stone-50 border-t border-stone-200 text-center">
          <button
            onClick={() => setSelectedOrderForReceipt(null)}
            className="w-full py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            {isTa ? 'மூடு' : 'Done / Close Receipt'}
          </button>
        </div>

      </div>
    </div>
  );
};

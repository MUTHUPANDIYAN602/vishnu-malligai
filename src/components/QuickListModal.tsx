import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant } from '../types';
import { ClipboardList, Check, Plus, ShoppingBag, ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

export const QuickListModal: React.FC = () => {
  const { products, addToCart, language, setIsCartOpen, setActiveView, shopSettings } = useStore();
  const isTa = language === 'ta';

  const [pastedText, setPastedText] = useState('');
  const [parsedItems, setParsedItems] = useState<{
    product: Product;
    variant: ProductVariant;
    quantity: number;
    matchScore: number;
  }[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  // Quick staple checklist quantities { [productId]: { variantId, qty } }
  const [stapleSelections, setStapleSelections] = useState<Record<string, { variantId: string; qty: number }>>(() => {
    const initial: Record<string, { variantId: string; qty: number }> = {};
    products.slice(0, 8).forEach(p => {
      initial[p.id] = { variantId: p.variants[0].id, qty: 1 };
    });
    return initial;
  });

  // Smart parser for town grocery lists
  const handleParseList = () => {
    if (!pastedText.trim()) return;

    const lines = pastedText
      .split(/[\n,;]+/)
      .map(l => l.trim())
      .filter(Boolean);

    const matches: {
      product: Product;
      variant: ProductVariant;
      quantity: number;
      matchScore: number;
    }[] = [];

    lines.forEach(line => {
      const lower = line.toLowerCase();
      // Extract numeric quantity if present
      const qtyMatch = lower.match(/(\d+(\.\d+)?)/);
      const extractedQty = qtyMatch ? parseFloat(qtyMatch[1]) : 1;

      // Find best product match
      let bestProduct: Product | null = null;
      let highestScore = 0;

      for (const prod of products) {
        let score = 0;
        const pEn = prod.nameEn.toLowerCase();
        const pTa = prod.nameTa.toLowerCase();

        // Exact keywords match
        if (lower.includes('ponni') && pEn.includes('ponni')) score += 10;
        if (lower.includes('basmati') && pEn.includes('basmati')) score += 10;
        if (lower.includes('idli') && pEn.includes('idli')) score += 10;
        if (lower.includes('toor') || lower.includes('துவரம்')) {
          if (pEn.includes('toor') || pTa.includes('துவரம்')) score += 10;
        }
        if (lower.includes('urad') || lower.includes('உளுந்து')) {
          if (pEn.includes('urad') || pTa.includes('உளுந்து')) score += 10;
        }
        if (lower.includes('moong') || lower.includes('பாசி')) {
          if (pEn.includes('moong') || pTa.includes('பாசி')) score += 10;
        }
        if (lower.includes('gingelly') || lower.includes('sesame') || lower.includes('நல்லெண்ணெய்')) {
          if (pEn.includes('gingelly') || pTa.includes('நல்லெண்ணெய்')) score += 10;
        }
        if (lower.includes('ghee') || lower.includes('நெய்')) {
          if (pEn.includes('ghee') || pTa.includes('நெய்')) score += 10;
        }
        if (lower.includes('sambar') || lower.includes('சாம்பார்')) {
          if (pEn.includes('sambar') || pTa.includes('சாம்பார்')) score += 10;
        }
        if (lower.includes('turmeric') || lower.includes('மஞ்சள்')) {
          if (pEn.includes('turmeric') || pTa.includes('மஞ்சள்')) score += 10;
        }
        if (lower.includes('pepper') || lower.includes('மிளகு')) {
          if (pEn.includes('pepper') || pTa.includes('மிளகு')) score += 10;
        }
        if (lower.includes('coffee') || lower.includes('காபி')) {
          if (pEn.includes('coffee') || pTa.includes('காபி')) score += 10;
        }
        if (lower.includes('sugar') || lower.includes('சர்க்கரை')) {
          if (pEn.includes('sugar') || pTa.includes('சர்க்கரை')) score += 10;
        }
        if (lower.includes('salt') || lower.includes('உப்பு')) {
          if (pEn.includes('salt') || pTa.includes('உப்பு')) score += 10;
        }

        if (score > highestScore) {
          highestScore = score;
          bestProduct = prod;
        }
      }

      if (bestProduct && highestScore > 0) {
        // Pick best matching variant
        let chosenVariant = bestProduct.variants[0];
        if (lower.includes('5kg') || lower.includes('5 kg')) {
          const v5 = bestProduct.variants.find(v => v.labelEn.includes('5 kg') || v.multiplier === 5);
          if (v5) chosenVariant = v5;
        } else if (lower.includes('25kg') || lower.includes('25 kg')) {
          const v25 = bestProduct.variants.find(v => v.labelEn.includes('25 kg') || v.multiplier >= 24);
          if (v25) chosenVariant = v25;
        } else if (lower.includes('500g') || lower.includes('500 ml') || lower.includes('500ml')) {
          const v500 = bestProduct.variants.find(v => v.labelEn.includes('500'));
          if (v500) chosenVariant = v500;
        } else if (lower.includes('100g')) {
          const v100 = bestProduct.variants.find(v => v.labelEn.includes('100g'));
          if (v100) chosenVariant = v100;
        } else if (lower.includes('250g')) {
          const v250 = bestProduct.variants.find(v => v.labelEn.includes('250g'));
          if (v250) chosenVariant = v250;
        }

        // Avoid duplicate products in parsed list
        const alreadyInList = matches.find(m => m.product.id === bestProduct!.id);
        if (!alreadyInList) {
          matches.push({
            product: bestProduct,
            variant: chosenVariant,
            quantity: Math.min(Math.max(1, Math.round(extractedQty)), 10),
            matchScore: highestScore,
          });
        }
      }
    });

    setParsedItems(matches);
    setHasParsed(true);
  };

  const handleAddAllParsed = () => {
    parsedItems.forEach(item => {
      addToCart(item.product, item.variant, item.quantity);
    });
    setAddedAllSuccess(true);
    setTimeout(() => {
      setIsCartOpen(true);
    }, 600);
  };

  const handleAddStaple = (product: Product) => {
    const sel = stapleSelections[product.id] || { variantId: product.variants[0].id, qty: 1 };
    const variant = product.variants.find(v => v.id === sel.variantId) || product.variants[0];
    addToCart(product, variant, sel.qty);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
          <ClipboardList className="w-4 h-4" />
          <span>{isTa ? 'எளிய பட்டியல் ஆர்டர்' : 'Quick Grocery List'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {isTa ? 'உங்கள் மளிகைப் பட்டியலை உள்ளிட்டு ஒரே கிளிக்கில் ஆர்டர் செய்யுங்கள்' : 'Order via Quick Grocery List or Paste handwritten list'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-3xl">
          {isTa
            ? 'அன்றாட சமையலுக்கு தேவையான மளிகை சாமான்களை ஒவ்வொன்றாக தேடாமல், உங்கள் பட்டியல் குறிப்புகளை கீழே ஒட்டலாம் அல்லது கீழே உள்ள விரைவு பட்டியலிலிருந்து எளிதாக தேர்வு செய்யலாம்.'
            : 'Town shoppers can quickly paste their household grocery notes, type list items, or check off household staples below in seconds.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Smart List Parser */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{isTa ? 'பட்டியல் குறிப்புகளை ஒட்டவும்' : 'Paste Your Grocery Notes'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setPastedText("5kg ponni rice\n1kg toor dal\n500g urad dal\n1L gingelly oil\n500g cow ghee\n250g coffee powder\n1kg salt")}
                className="text-xs text-amber-800 hover:underline cursor-pointer"
              >
                {isTa ? 'மாதிரி பட்டியல் நிரப்பு' : 'Fill Sample List'}
              </button>
            </div>

            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                setHasParsed(false);
              }}
              placeholder={isTa 
                ? "உதாரணம்:\n5kg பொன்னி அரிசி\n1kg துவரம் பருப்பு\n500ml நல்லெண்ணெய்\n250g காபி தூள்" 
                : "Example:\n5kg ponni rice\n1kg toor dal\n1L gingelly oil\n500g ghee\n1kg salt"}
              className="w-full p-3 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleParseList}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                {isTa ? 'பட்டியலை சரிபார்' : 'Match Items with Store'}
              </button>

              {pastedText && (
                <button
                  type="button"
                  onClick={() => { setPastedText(''); setParsedItems([]); setHasParsed(false); }}
                  className="px-3 py-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  {isTa ? 'அழி' : 'Clear'}
                </button>
              )}
            </div>

            {/* Parsed Results Preview */}
            {hasParsed && (
              <div className="pt-3 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">
                    {parsedItems.length} {isTa ? 'பொருட்கள் கண்டுபிடிக்கப்பட்டன:' : 'Items matched in store:'}
                  </span>
                  {parsedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAddAllParsed}
                      disabled={addedAllSuccess}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {addedAllSuccess ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                      <span>{addedAllSuccess ? (isTa ? 'சேர்க்கப்பட்டது!' : 'Added to Cart!') : (isTa ? 'அனைத்தையும் பையில் சேர்' : 'Add All to Cart')}</span>
                    </button>
                  )}
                </div>

                {parsedItems.length === 0 ? (
                  <p className="text-xs text-stone-500 py-3 text-center">
                    {isTa ? 'பட்டியலில் உள்ள பொருட்கள் பெயர் பொருந்தவில்லை. கீழே உள்ள பட்டியலில் இருந்து தேர்வு செய்யலாம்.' : 'Could not match items. Please pick from household staples on the right.'}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {parsedItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-stone-900">{isTa ? item.product.nameTa : item.product.nameEn}</p>
                          <p className="text-stone-500 text-[11px]">{item.variant.labelEn} × {item.quantity}</p>
                        </div>
                        <span className="font-bold text-stone-900 tabular-nums shrink-0">
                          ₹{Math.round(item.product.basePrice * item.variant.multiplier * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Direct WhatsApp List Order Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>{isTa ? 'வாட்ஸ்அப்பில் உங்கள் சீட்டு / பட்டியலை அனுப்பலாம்' : 'Prefer sending handwritten list on WhatsApp?'}</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {isTa 
                ? 'உங்கள் கையில் எழுதிய மளிகை சீட்டை போட்டோ எடுத்து எங்கள் வாட்ஸ்அப் எண்ணிற்கு நேரடியாக அனுப்பினால், உடனடியாக பேக்கிங் செய்து விடுவோம்.' 
                : 'Take a quick photo of your paper list and send directly to Vishnu Malligai WhatsApp number.'}
            </p>
            <a
              href={`https://wa.me/${shopSettings.whatsappPhone}?text=${encodeURIComponent(
                isTa 
                  ? 'வணக்கம் விஷ்ணு மளிகை, எனது மளிகைப் பட்டியல் இதோ: ' 
                  : 'Hello Vishnu Malligai, I want to place a grocery order: '
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isTa ? 'வாட்ஸ்அப் மூலம் அனுப்ப (+91 98421 55678)' : 'Send to WhatsApp (+91 98421 55678)'}</span>
            </a>
          </div>
        </div>

        {/* Right Column: Fast Staples Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-stone-900 flex items-center justify-between">
              <span>{isTa ? 'அன்றாட சமையல் முக்கியப் பொருட்கள்' : 'Essential Household Staples'}</span>
              <span className="text-[11px] font-normal text-stone-500">
                {isTa ? 'நேரடியாக அளவை மாற்றி சேருங்கள்' : 'Pick quantity & add'}
              </span>
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {products.slice(0, 10).map(product => {
                const sel = stapleSelections[product.id] || { variantId: product.variants[0].id, qty: 1 };
                const currentVariant = product.variants.find(v => v.id === sel.variantId) || product.variants[0];
                const price = Math.round(product.basePrice * currentVariant.multiplier);

                return (
                  <div key={product.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {isTa ? product.nameTa : product.nameEn}
                      </p>
                      
                      {/* Pack selector */}
                      <div className="flex items-center gap-2 mt-1">
                        <select
                          value={sel.variantId}
                          onChange={(e) => {
                            setStapleSelections(prev => ({
                              ...prev,
                              [product.id]: { ...sel, variantId: e.target.value }
                            }));
                          }}
                          className="text-[11px] bg-white border border-stone-300 rounded px-1.5 py-0.5 text-stone-700"
                        >
                          {product.variants.map(v => (
                            <option key={v.id} value={v.id}>
                              {isTa ? v.labelTa : v.labelEn}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs font-bold text-stone-900 tabular-nums">
                          ₹{price * sel.qty}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddStaple(product)}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isTa ? 'சேர்' : 'Add'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveView('storefront')}
                className="text-xs text-stone-600 hover:text-stone-900"
              >
                {isTa ? '← முழு கடைக்கு திரும்ப' : '← Back to full store'}
              </button>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isTa ? 'ஷாப்பிங் பையைப் பார்' : 'View Cart & Checkout'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

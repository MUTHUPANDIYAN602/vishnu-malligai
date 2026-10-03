/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { CustomerStorefront } from './components/CustomerStorefront';
import { OwnerDashboard } from './components/OwnerDashboard';
import { OrderTrackingView } from './components/OrderTrackingView';
import { QuickListModal } from './components/QuickListModal';
import { CartDrawer } from './components/CartDrawer';
import { PrintableReceipt } from './components/PrintableReceipt';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'storefront' && <CustomerStorefront />}
        {activeView === 'quick_list' && <QuickListModal />}
        {activeView === 'tracking' && <OrderTrackingView />}
        {activeView === 'dashboard' && <OwnerDashboard />}
      </main>

      {/* Floating / Global Modals & Drawers */}
      <CartDrawer />
      <PrintableReceipt />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Megaphone,
  LayoutDashboard,
  LogOut,
  Loader2,
  Heart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { Product, Order, Customer } from '../types';
import { STORE_NAME } from '../constants';

// Components
import { SidebarLink } from '../components/admin/SidebarLink';
import { DashboardView } from '../components/admin/DashboardView';
import { ProductsView } from '../components/admin/ProductsView';
import { OrdersView } from '../components/admin/OrdersView';
import { CustomersView } from '../components/admin/CustomersView';
import { MarketingView } from '../components/admin/MarketingView';
import { ReportsView } from '../components/admin/ReportsView';
import { SettingsView } from '../components/admin/SettingsView';
import { WishesView } from '../components/admin/WishesView';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  // Fetch Data
  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
      setFetching(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
      setFetching(false);
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(50)), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    const unsubCustomers = onSnapshot(query(collection(db, 'users'), limit(100)), (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Stats Calculation
  const stats = {
    totalRevenue: orders.reduce((acc, order) => acc + (order.total || 0), 0),
    totalOrders: orders.length,
    activeProducts: products.filter(p => (p as any).status === 'active').length,
    totalCustomers: customers.length,
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-neutral-900">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-neutral-200 flex-col p-6 fixed h-full z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-100">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-neutral-900">{STORE_NAME.split('.')[0].toUpperCase()}</span>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={<Package />} 
            label="Catálogo" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarLink 
            icon={<ShoppingCart />} 
            label="Vendas" 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <SidebarLink
            icon={<Users />}
            label="Clientes"
            active={activeTab === 'customers'}
            onClick={() => setActiveTab('customers')}
          />
          <SidebarLink
            icon={<Heart />}
            label="Desejos"
            active={activeTab === 'wishes'}
            onClick={() => setActiveTab('wishes')}
          />
          <SidebarLink
            icon={<Megaphone />}
            label="Marketing"
            active={activeTab === 'marketing'}
            onClick={() => setActiveTab('marketing')}
          />
          <SidebarLink 
            icon={<BarChart3 />} 
            label="Relatórios" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
          <SidebarLink 
            icon={<Settings />} 
            label="Definições" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-100">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {auth.currentUser?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{auth.currentUser?.displayName || 'Admin'}</p>
              <p className="text-xs text-neutral-400 font-medium truncate">{auth.currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-600 hover:bg-red-50 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView orders={orders} products={products} stats={stats} />}
          {activeTab === 'products' && <ProductsView products={products} />}
          {activeTab === 'orders' && <OrdersView orders={orders} />}
          {activeTab === 'customers' && <CustomersView customers={customers} orders={orders} />}
          {activeTab === 'wishes' && <WishesView />}
          {activeTab === 'marketing' && <MarketingView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
}

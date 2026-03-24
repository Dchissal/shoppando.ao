import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Order, Product } from '../../types';
import { SALES_DATA } from '../../constants';

function StatCard({ title, value, change, icon, color }: { title: string, value: string, change: string, icon: React.ReactNode, color: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" })}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-neutral-500 text-sm font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-neutral-900 mt-1">{value}</h3>
    </div>
  );
}

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  stats: {
    totalRevenue: number;
    totalOrders: number;
    activeProducts: number;
    totalCustomers: number;
  };
}

export function DashboardView({ orders, products, stats }: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturação Total" 
          value={`${stats.totalRevenue.toLocaleString()} Kz`} 
          change="+12.5%" 
          icon={<DollarSign />} 
          color="bg-green-50 text-green-600" 
        />
        <StatCard 
          title="Encomendas" 
          value={stats.totalOrders.toString()} 
          change="+8.2%" 
          icon={<ShoppingCart />} 
          color="bg-blue-50 text-blue-600" 
        />
        <StatCard 
          title="Artigos Ativos" 
          value={stats.activeProducts.toString()} 
          change="+2.4%" 
          icon={<Package />} 
          color="bg-purple-50 text-purple-600" 
        />
        <StatCard 
          title="Total Clientes" 
          value={stats.totalCustomers.toString()} 
          change="+15.3%" 
          icon={<Users />} 
          color="bg-orange-50 text-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Desempenho de Vendas</h3>
            <select className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-sm font-bold outline-none">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Últimas Encomendas</h3>
          <div className="space-y-4">
            {orders.length > 0 ? orders.slice(0, 6).map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-colors cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold group-hover:bg-white transition-colors">
                  {order.customer?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{order.customer?.name || 'Utilizador'}</p>
                  <p className="text-xs text-neutral-400 font-medium">{order.total?.toLocaleString()} Kz</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {order.status}
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <Clock className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                <p className="text-neutral-400 text-sm font-bold">Sem encomendas recentes</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-3 text-sm font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
            Ver Todas as Encomendas
          </button>
        </div>
      </div>

      {/* Alerts & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" /> Alertas de Stock Baixo
            </h3>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Abaixo de 5 un.</span>
          </div>
          <div className="space-y-4">
            {products.filter(p => p.stock < 5).slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 border border-red-50 bg-red-50/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                    <img src={product.imageURL} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{product.name}</p>
                    <p className="text-xs text-neutral-400">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600">{product.stock} un.</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Restantes</p>
                </div>
              </div>
            ))}
            {products.filter(p => p.stock < 5).length === 0 && (
              <div className="text-center py-10 bg-green-50/30 rounded-3xl border border-green-100">
                <p className="text-green-600 text-sm font-bold">Stock em níveis ideais</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-6">Artigos Mais Vendidos</h3>
          <div className="space-y-4">
            {products
              .map(p => ({
                ...p,
                sales: orders.reduce((acc, o) => acc + (o.items?.filter(i => i.id === p.id).reduce((sum, item) => sum + (item.quantity || 0), 0) || 0), 0)
              }))
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-2xl transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 flex items-center justify-center text-xs font-black text-neutral-400">
                    0{idx + 1}
                  </div>
                  <img src={product.imageURL} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-900">{product.name}</p>
                    <p className="text-xs text-neutral-400 font-medium">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-neutral-900">{product.sales} vendas</p>
                    <div className="w-24 h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 rounded-full" 
                        style={{ width: `${Math.min(100, (product.sales / (orders.length || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

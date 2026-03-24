import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowUpRight, BarChart3, Eye, X, ShoppingCart } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Customer, Order } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
}

export function CustomersView({ customers, orders }: CustomersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (window.confirm(`Tens a certeza que queres promover este utilizador a ${newRole}?`)) {
      try {
        await updateDoc(doc(db, 'users', id), { role: newRole });
        alert("Cargo atualizado com sucesso!");
      } catch (err) {
        console.error("Error updating role:", err);
        alert("Erro ao atualizar cargo.");
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { status: newStatus });
      alert(`Estado do utilizador atualizado para ${newStatus}.`);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Erro ao atualizar estado.");
    }
  };

  const customerOrders = selectedCustomer ? orders.filter(o => o.userId === selectedCustomer.id) : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg">Base de Clientes</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Procurar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-orange-600 transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Contacto</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Cargo</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Desde</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                        {customer.name?.charAt(0)}
                      </div>
                      <span className="font-bold text-neutral-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-neutral-900">{customer.email}</p>
                    <p className="text-xs text-neutral-400">{customer.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        customer.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {customer.role}
                      </span>
                      {customer.role !== 'admin' && (
                        <button 
                          onClick={() => handleUpdateRole(customer.id, 'admin')}
                          className="p-1 text-neutral-400 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all"
                          title="Promover a Admin"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={customer.status || 'active'}
                      onChange={(e) => handleUpdateStatus(customer.id, e.target.value)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer ${
                        customer.status === 'suspended' ? 'bg-red-100 text-red-600' : 
                        customer.status === 'inactive' ? 'bg-neutral-100 text-neutral-400' : 'bg-green-100 text-green-600'
                      }`}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="suspended">Suspenso</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">
                    {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setShowActionsModal(true);
                        }}
                        className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="Ver Atividade"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-neutral-900 rounded-lg transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Activity Modal */}
      {showActionsModal && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xl">
                  {selectedCustomer.name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">{selectedCustomer.name}</h2>
                  <p className="text-neutral-500 font-medium text-sm">Histórico de Atividade do Cliente</p>
                </div>
              </div>
              <button 
                onClick={() => setShowActionsModal(false)}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Total Gasto</p>
                  <p className="text-lg font-black text-neutral-900">
                    {customerOrders.reduce((acc, o) => acc + (o.total || 0), 0).toLocaleString()} Kz
                  </p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Encomendas</p>
                  <p className="text-lg font-black text-neutral-900">{customerOrders.length}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Estado</p>
                  <p className="text-lg font-black text-orange-600 uppercase text-[10px]">{selectedCustomer.status || 'active'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-neutral-400">Últimas Encomendas</h4>
                {customerOrders.length > 0 ? (
                  <div className="space-y-3">
                    {customerOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-xl shadow-sm">
                            <ShoppingCart className="w-4 h-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] text-neutral-400 font-medium">
                              {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-neutral-900">{order.total?.toLocaleString()} Kz</p>
                          <span className="text-[10px] font-black uppercase text-orange-600">{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-neutral-50 rounded-3xl">
                    <ShoppingCart className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm font-bold">Este cliente ainda não fez compras.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-neutral-50/50 border-t border-neutral-100 flex gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedCustomer.id, selectedCustomer.status === 'suspended' ? 'active' : 'suspended')}
                className={`flex-1 py-4 font-black rounded-2xl transition-all ${
                  selectedCustomer.status === 'suspended' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {selectedCustomer.status === 'suspended' ? 'Reativar Conta' : 'Suspender Conta'}
              </button>
              <button 
                onClick={() => setShowActionsModal(false)}
                className="flex-1 py-4 bg-neutral-900 text-white font-black rounded-2xl hover:bg-neutral-800 transition-all"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

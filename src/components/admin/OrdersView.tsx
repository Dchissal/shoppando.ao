import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Eye, X, CheckCircle2, Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';
import { Order } from '../../types';
import { notifyOrderStatusChange } from '../../lib/notifications';

interface OrdersViewProps {
  orders: Order[];
}

export function OrdersView({ orders }: OrdersViewProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string, order: Order) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });

      // Notify the customer about the status change
      if (order.userId) {
        await notifyOrderStatusChange(order.userId, orderId, newStatus);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Data', 'Total', 'Estado'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customer?.name || 'N/A',
      o.customer?.email || 'N/A',
      o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : 'N/A',
      o.total,
      o.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `encomendas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Encomendas</h2>
          <p className="text-neutral-500 font-medium">Gere as tuas encomendas e envios</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === status 
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' 
                : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">ID Pedido</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-xs font-black text-neutral-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-neutral-900">#{order.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500">
                        {order.customer?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{order.customer?.name || 'Utilizador'}</p>
                        <p className="text-xs text-neutral-400 font-medium">{order.customer?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500 font-medium">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </td>
                  <td className="px-6 py-4 font-black text-neutral-900">{order.total?.toLocaleString()} Kz</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any, order)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 
                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                      }`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="processing">Processamento</option>
                      <option value="shipped">Enviado</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-neutral-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-neutral-400 font-bold">
                    Nenhuma encomenda encontrada com este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Detalhes da Encomenda</h3>
                <p className="text-neutral-400 font-mono text-sm">#{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-neutral-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Informação do Cliente</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-neutral-900">{selectedOrder.customer?.name}</p>
                    <p className="text-sm text-neutral-500 font-medium">{selectedOrder.customer?.email}</p>
                    <p className="text-sm text-neutral-500 font-medium">{selectedOrder.customer?.phone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Endereço de Entrega</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500 font-medium">{selectedOrder.customer?.address}</p>
                    <p className="text-sm text-neutral-500 font-medium">{selectedOrder.customer?.city}</p>
                    <p className="text-sm font-bold text-neutral-900 mt-2">Pagamento: {selectedOrder.customer?.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Artigos</h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl">
                      <div className="w-16 h-16 rounded-xl bg-white border border-neutral-200 overflow-hidden">
                        <img src={item.imageURL} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-neutral-900">{item.name}</p>
                        <p className="text-xs text-neutral-400 font-medium">Qtd: {item.quantity} × {item.price?.toLocaleString()} Kz</p>
                      </div>
                      <p className="text-sm font-black text-neutral-900">{(item.price * item.quantity).toLocaleString()} Kz</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-6 border-t border-neutral-100 flex justify-between items-center">
                <p className="text-lg font-bold text-neutral-900">Total da Encomenda</p>
                <p className="text-2xl font-black text-orange-600">{selectedOrder.total?.toLocaleString()} Kz</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

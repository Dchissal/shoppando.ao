import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  Mail,
  User,
  Package,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Wish } from '../../types';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  reviewed: { label: 'Analisado', color: 'bg-blue-100 text-blue-700', icon: Eye },
  fulfilled: { label: 'Atendido', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export function WishesView() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Wish));
      setWishes(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wishes');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, status: Wish['status']) => {
    try {
      await updateDoc(doc(db, 'wishes', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `wishes/${id}`);
    }
  };

  const deleteWish = async (id: string) => {
    if (!window.confirm('Tens a certeza que queres eliminar este pedido?')) return;
    try {
      await deleteDoc(doc(db, 'wishes', id));
      setSelectedWish(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `wishes/${id}`);
    }
  };

  const filteredWishes = wishes.filter(wish => {
    const matchesSearch =
      wish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wish.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wish.products.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || wish.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: wishes.length,
    pending: wishes.filter(w => w.status === 'pending').length,
    reviewed: wishes.filter(w => w.status === 'reviewed').length,
    fulfilled: wishes.filter(w => w.status === 'fulfilled').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">{stats.total}</p>
              <p className="text-xs font-medium text-neutral-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">{stats.pending}</p>
              <p className="text-xs font-medium text-neutral-500">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">{stats.reviewed}</p>
              <p className="text-xs font-medium text-neutral-500">Analisados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-neutral-900">{stats.fulfilled}</p>
              <p className="text-xs font-medium text-neutral-500">Atendidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-neutral-200">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome, email ou produto..."
            className="w-full bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-orange-600 transition-all outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-neutral-50 border border-neutral-100 rounded-xl py-2.5 px-4 focus:ring-2 focus:ring-orange-600 outline-none font-medium"
          >
            <option value="all">Todos os estados</option>
            <option value="pending">Pendentes</option>
            <option value="reviewed">Analisados</option>
            <option value="fulfilled">Atendidos</option>
          </select>
        </div>
      </div>

      {/* Wishes List */}
      <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 font-medium">A carregar pedidos...</p>
          </div>
        ) : filteredWishes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-lg font-bold text-neutral-900">Sem pedidos de desejos</p>
            <p className="text-neutral-500 text-sm">Os pedidos dos clientes aparecerão aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredWishes.map(wish => {
              const StatusIcon = STATUS_CONFIG[wish.status].icon;
              return (
                <div
                  key={wish.id}
                  className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedWish(wish)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {wish.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-neutral-900">{wish.name}</h3>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_CONFIG[wish.status].color}`}>
                            {STATUS_CONFIG[wish.status].label}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {wish.email}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {wish.products.slice(0, 3).map((product, i) => (
                            <span key={i} className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full font-medium">
                              {product}
                            </span>
                          ))}
                          {wish.products.length > 3 && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-bold">
                              +{wish.products.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-neutral-400 flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {wish.createdAt?.toDate?.().toLocaleDateString('pt-AO') || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedWish && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm"
              onClick={() => setSelectedWish(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-black">
                    {selectedWish.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{selectedWish.name}</h3>
                    <p className="text-white/80 text-sm">{selectedWish.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Categorias de Interesse
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWish.categories.map((cat, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-orange-500" />
                    Produtos Desejados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedWish.products.map((product, i) => (
                      <span key={i} className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-medium">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status Change */}
                <div>
                  <h4 className="font-bold text-neutral-900 mb-2">Alterar Estado</h4>
                  <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedWish.id, status as Wish['status'])}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            selectedWish.status === status
                              ? 'bg-orange-600 text-white'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-neutral-100">
                  <button
                    onClick={() => setSelectedWish(null)}
                    className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition-all"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => deleteWish(selectedWish.id)}
                    className="py-3 px-4 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-all flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

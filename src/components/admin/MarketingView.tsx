import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, X, Calendar, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestore-errors';

export function MarketingView() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'coupons'));
    return () => unsub();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await addDoc(collection(db, 'coupons'), {
        code: (formData.get('code') as string).toUpperCase(),
        discount: Number(formData.get('discount')),
        type: formData.get('type') as string,
        minPurchase: Number(formData.get('minPurchase')) || 0,
        expiryDate: formData.get('expiryDate') as string,
        status: 'active',
        createdAt: serverTimestamp(),
      });
      setShowAddCoupon(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'coupons');
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (window.confirm("Tens a certeza que queres eliminar este cupão?")) {
      try {
        await deleteDoc(doc(db, 'coupons', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'coupons');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-neutral-900 tracking-tight">Gestão de Cupões</h3>
        <button 
          onClick={() => setShowAddCoupon(true)}
          className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Cupão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <motion.div 
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-md transition-all group relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `${coupon.discount} Kz OFF`}
              </div>
              <button 
                onClick={() => deleteCoupon(coupon.id)}
                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h4 className="text-2xl font-black text-neutral-900 tracking-tight mb-1">{coupon.code}</h4>
            <p className="text-neutral-500 text-sm font-medium mb-4">
              Mínimo: {coupon.minPurchase?.toLocaleString()} Kz
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
              <Calendar className="w-3 h-3" />
              Expira em: {new Date(coupon.expiryDate).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>

      {showAddCoupon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Novo Cupão</h2>
              <button onClick={() => setShowAddCoupon(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={handleAddCoupon}>
              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Código do Cupão</label>
                <input name="code" type="text" placeholder="EX: VERÃO2024" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-black uppercase" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Tipo</label>
                  <select name="type" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold appearance-none" required>
                    <option value="percentage">Percentagem (%)</option>
                    <option value="fixed">Valor Fixo (Kz)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Valor</label>
                  <input name="discount" type="number" placeholder="0" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Data de Expiração</label>
                <input name="expiryDate" type="date" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold" required />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Criar Cupão</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

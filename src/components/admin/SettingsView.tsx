import React from 'react';
import { DollarSign, Truck } from 'lucide-react';
import { STORE_NAME } from '../../constants';

export function SettingsView() {
  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-neutral-900 tracking-tight">Pagamentos & Checkout</h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Multicaixa Express</p>
                <p className="text-xs text-neutral-400 font-medium">Pagamento por Referência</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-orange-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-xl shadow-sm">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-bold text-neutral-900">Pagamento na Entrega</p>
                <p className="text-xs text-neutral-400 font-medium">Dinheiro ou TPA</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-orange-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-neutral-900 tracking-tight">Dados da Loja</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">Nome da Loja</label>
            <input type="text" defaultValue={STORE_NAME} className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">NIF / CNPJ</label>
            <input type="text" placeholder="000000000" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none font-bold" />
          </div>
        </div>
        <button className="mt-8 px-8 py-4 bg-neutral-900 text-white font-black rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-neutral-200">
          Guardar Alterações
        </button>
      </div>
    </div>
  );
}

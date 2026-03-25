import React from 'react';
import { Package, Box } from 'lucide-react';
import { ProductType, CATEGORY_ATTRIBUTES } from '../../../../types';

interface BasicInfoStepProps {
  name: string;
  description: string;
  category: string;
  productType: ProductType;
  // Campos para produto simples
  price: number;
  oldPrice: number;
  stock: number;
  sku: string;
  onUpdate: (field: string, value: any) => void;
}

const CATEGORIES = [
  'Eletrónicos',
  'Moda',
  'Casa',
  'Beleza',
  'Desporto',
];

export function BasicInfoStep({
  name,
  description,
  category,
  productType,
  price,
  oldPrice,
  stock,
  sku,
  onUpdate,
}: BasicInfoStepProps) {
  const categoryAttributes = category ? CATEGORY_ATTRIBUTES[category] || [] : [];
  const canBeVariable = categoryAttributes.length > 0;

  return (
    <div className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
          Nome do Artigo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onUpdate('name', e.target.value)}
          placeholder="Ex: iPhone 15 Pro Max"
          className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold text-lg"
        />
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => onUpdate('description', e.target.value)}
          placeholder="Descreve as características principais do produto..."
          rows={3}
          className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-medium resize-none"
        />
      </div>

      {/* Categoria */}
      <div className="space-y-2">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
          Categoria <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => {
            onUpdate('category', e.target.value);
            // Reset tipo para simples se nova categoria não suportar variantes
            const newCatAttrs = CATEGORY_ATTRIBUTES[e.target.value] || [];
            if (newCatAttrs.length === 0 && productType === 'variable') {
              onUpdate('productType', 'simple');
            }
          }}
          className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold appearance-none cursor-pointer"
        >
          <option value="">Seleciona uma categoria...</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tipo de Produto */}
      <div className="space-y-3">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
          Tipo de Produto <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 gap-4">
          {/* Simples */}
          <button
            type="button"
            onClick={() => onUpdate('productType', 'simple')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              productType === 'simple'
                ? 'border-orange-500 bg-orange-50'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                productType === 'simple' ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-bold ${productType === 'simple' ? 'text-orange-600' : 'text-neutral-900'}`}>
                  Simples
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              Produto sem variações. Ex: Auricular de cor única, Livro.
            </p>
          </button>

          {/* Variável */}
          <button
            type="button"
            onClick={() => canBeVariable && onUpdate('productType', 'variable')}
            disabled={!canBeVariable}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              productType === 'variable'
                ? 'border-orange-500 bg-orange-50'
                : canBeVariable
                  ? 'border-neutral-200 hover:border-neutral-300'
                  : 'border-neutral-100 bg-neutral-50 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                productType === 'variable' ? 'bg-orange-500 text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                <Box className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-bold ${productType === 'variable' ? 'text-orange-600' : 'text-neutral-900'}`}>
                  Variável
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-500">
              {canBeVariable
                ? 'Produto com variantes. Ex: Sapatilhas com tamanhos, iPhone com cores/memória.'
                : 'Seleciona uma categoria que suporte variantes.'}
            </p>
          </button>
        </div>
      </div>

      {/* Campos de Produto Simples */}
      {productType === 'simple' && (
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Preço */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                Preço (Kz) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => onUpdate('price', Number(e.target.value))}
                placeholder="0"
                min="0"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
              />
            </div>

            {/* Preço Antigo */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                Preço Antigo (Kz)
              </label>
              <input
                type="number"
                value={oldPrice || ''}
                onChange={(e) => onUpdate('oldPrice', Number(e.target.value))}
                placeholder="Opcional"
                min="0"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Stock */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                Stock Inicial <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={stock || ''}
                onChange={(e) => onUpdate('stock', Number(e.target.value))}
                placeholder="0"
                min="0"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-bold"
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
                SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => onUpdate('sku', e.target.value)}
                placeholder="Opcional"
                className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl focus:border-orange-500 outline-none font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Wand2, AlertCircle } from 'lucide-react';
import { ProductVariant, ProductAttribute, AttributeType } from '../../../../types';
import { VariantRow } from '../components/VariantRow';

interface VariantsStepProps {
  productName: string;
  attributes: ProductAttribute[];
  variants: ProductVariant[];
  basePrice: number;
  baseStock: number;
  onUpdate: (variants: ProductVariant[]) => void;
  onVariantImageUpload?: (variantId: string, file: File) => void;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function generateSKU(productName: string, attributes: Partial<Record<AttributeType, string>>): string {
  const base = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const attrCodes = Object.values(attributes)
    .map((v) => v?.slice(0, 3).toUpperCase() || '')
    .filter(Boolean)
    .join('-');

  return `${base}-${attrCodes}`;
}

function generateVariantCombinations(
  attributes: ProductAttribute[],
  productName: string,
  basePrice: number,
  baseStock: number
): ProductVariant[] {
  if (attributes.length === 0) return [];

  // Cartesian product
  const valueSets = attributes.map((attr) =>
    attr.values.map((v) => ({ type: attr.type, value: v }))
  );

  const combinations: Array<Array<{ type: AttributeType; value: string }>> =
    valueSets.reduce<Array<Array<{ type: AttributeType; value: string }>>>(
      (acc, values) => {
        if (acc.length === 0) return values.map((v) => [v]);
        return acc.flatMap((existing) => values.map((v) => [...existing, v]));
      },
      []
    );

  return combinations.map((combo, index) => {
    const attrs: Partial<Record<AttributeType, string>> = {};
    combo.forEach((item) => {
      attrs[item.type] = item.value;
    });

    return {
      id: generateId(),
      sku: generateSKU(productName, attrs),
      attributes: attrs,
      price: basePrice,
      stock: baseStock,
      imageURL: undefined,
      isDefault: index === 0,
      isActive: true,
    };
  });
}

export function VariantsStep({
  productName,
  attributes,
  variants,
  basePrice,
  baseStock,
  onUpdate,
  onVariantImageUpload,
}: VariantsStepProps) {
  const handleGenerateVariants = () => {
    const newVariants = generateVariantCombinations(
      attributes,
      productName,
      basePrice,
      baseStock
    );
    onUpdate(newVariants);
  };

  const handleUpdateVariant = (updatedVariant: ProductVariant) => {
    onUpdate(
      variants.map((v) => (v.id === updatedVariant.id ? updatedVariant : v))
    );
  };

  const handleBulkPriceUpdate = (newPrice: number) => {
    onUpdate(variants.map((v) => ({ ...v, price: newPrice })));
  };

  const handleBulkStockUpdate = (newStock: number) => {
    onUpdate(variants.map((v) => ({ ...v, stock: newStock })));
  };

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  const activeVariants = variants.filter((v) => v.isActive).length;

  // Verificar se precisa gerar variantes
  const expectedCombinations = attributes.reduce(
    (acc, attr) => acc * attr.values.length,
    1
  );
  const needsGeneration = variants.length === 0 || variants.length !== expectedCombinations;

  return (
    <div className="space-y-6">
      {/* Header com stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-neutral-900">Matriz de Variantes</h3>
          <p className="text-sm text-neutral-500">
            Configure preço, stock e imagem para cada combinação
          </p>
        </div>

        {variants.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="px-3 py-1.5 bg-neutral-100 rounded-lg">
              <span className="text-neutral-500">Variantes:</span>{' '}
              <strong className="text-neutral-900">{activeVariants}/{variants.length}</strong>
            </div>
            <div className="px-3 py-1.5 bg-neutral-100 rounded-lg">
              <span className="text-neutral-500">Stock Total:</span>{' '}
              <strong className="text-neutral-900">{totalStock} un.</strong>
            </div>
          </div>
        )}
      </div>

      {/* Alerta para gerar variantes */}
      {needsGeneration && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800 font-medium">
                {variants.length === 0
                  ? `Precisas de gerar as variantes baseadas nos atributos seleccionados.`
                  : `Os atributos mudaram. Regenera as variantes para actualizar.`}
              </p>
              <button
                type="button"
                onClick={handleGenerateVariants}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
              >
                <Wand2 className="w-4 h-4" />
                {variants.length === 0 ? 'Gerar Variantes' : 'Regenerar Variantes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de variantes */}
      {variants.length > 0 && (
        <>
          {/* Edição em massa */}
          <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <span className="text-xs font-bold text-neutral-500 uppercase">
              Editar todos:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Preço"
                className="w-28 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm focus:border-orange-500 outline-none"
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val > 0) {
                    handleBulkPriceUpdate(val);
                    e.target.value = '';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val > 0) {
                      handleBulkPriceUpdate(val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <span className="text-xs text-neutral-400">Kz</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Stock"
                className="w-20 px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm focus:border-orange-500 outline-none"
                onBlur={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 0) {
                    handleBulkStockUpdate(val);
                    e.target.value = '';
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = Number((e.target as HTMLInputElement).value);
                    if (val >= 0) {
                      handleBulkStockUpdate(val);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }
                }}
              />
              <span className="text-xs text-neutral-400">un.</span>
            </div>
          </div>

          {/* Tabela */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="px-3 py-3 text-left text-[10px] font-black text-neutral-400 uppercase w-14">
                      Img
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black text-neutral-400 uppercase">
                      Variante
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black text-neutral-400 uppercase w-36">
                      SKU
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black text-neutral-400 uppercase w-32">
                      Preço
                    </th>
                    <th className="px-3 py-3 text-left text-[10px] font-black text-neutral-400 uppercase w-24">
                      Stock
                    </th>
                    <th className="px-3 py-3 text-center text-[10px] font-black text-neutral-400 uppercase w-16">
                      Activo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <VariantRow
                      key={variant.id}
                      variant={variant}
                      onChange={handleUpdateVariant}
                      onImageUpload={onVariantImageUpload}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

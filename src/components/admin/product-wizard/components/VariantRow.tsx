import React, { useRef } from 'react';
import { Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { ProductVariant, COLOR_HEX_MAP, AttributeType } from '../../../../types';

interface VariantRowProps {
  variant: ProductVariant;
  onChange: (variant: ProductVariant) => void;
  onImageUpload?: (variantId: string, file: File) => void;
}

export function VariantRow({ variant, onChange, onImageUpload }: VariantRowProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFieldChange = (field: keyof ProductVariant, value: any) => {
    onChange({ ...variant, [field]: value });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(variant.id, file);
    }
  };

  const getAttributeLabel = (): string => {
    return Object.entries(variant.attributes)
      .map(([_, value]) => value)
      .join(' / ');
  };

  const getColorFromAttributes = (): string | undefined => {
    return variant.attributes.color;
  };

  const color = getColorFromAttributes();
  const colorHex = color ? COLOR_HEX_MAP[color] : undefined;

  return (
    <tr className={`border-b border-neutral-100 ${!variant.isActive ? 'opacity-50' : ''}`}>
      {/* Imagem */}
      <td className="px-3 py-3">
        <div
          onClick={handleImageClick}
          className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden cursor-pointer hover:border-orange-400 transition-colors flex items-center justify-center"
        >
          {variant.imageURL ? (
            <img
              src={variant.imageURL}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-neutral-300" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </td>

      {/* Atributos */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {colorHex && (
            <span
              className="w-4 h-4 rounded-full border border-neutral-200"
              style={{ backgroundColor: colorHex }}
            />
          )}
          <span className="font-medium text-neutral-900 text-sm">
            {getAttributeLabel()}
          </span>
        </div>
      </td>

      {/* SKU */}
      <td className="px-3 py-3">
        <input
          type="text"
          value={variant.sku}
          onChange={(e) => handleFieldChange('sku', e.target.value)}
          className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-mono focus:border-orange-500 outline-none"
          placeholder="SKU"
        />
      </td>

      {/* Preço */}
      <td className="px-3 py-3">
        <div className="relative">
          <input
            type="number"
            value={variant.price}
            onChange={(e) => handleFieldChange('price', Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm font-bold focus:border-orange-500 outline-none pr-10"
            placeholder="0"
            min="0"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400">
            Kz
          </span>
        </div>
      </td>

      {/* Stock */}
      <td className="px-3 py-3">
        <input
          type="number"
          value={variant.stock}
          onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
          className={`w-20 px-2.5 py-1.5 bg-neutral-50 border rounded-lg text-sm font-bold focus:border-orange-500 outline-none ${
            variant.stock < 5 ? 'border-red-300 text-red-600' : 'border-neutral-200'
          }`}
          placeholder="0"
          min="0"
        />
      </td>

      {/* Activo */}
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          onClick={() => handleFieldChange('isActive', !variant.isActive)}
          className={`p-1 rounded-lg transition-colors ${
            variant.isActive
              ? 'text-green-600 hover:bg-green-50'
              : 'text-neutral-300 hover:bg-neutral-100'
          }`}
        >
          {variant.isActive ? (
            <ToggleRight className="w-6 h-6" />
          ) : (
            <ToggleLeft className="w-6 h-6" />
          )}
        </button>
      </td>
    </tr>
  );
}

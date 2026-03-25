import React, { useRef } from 'react';
import { Star, FileText, Upload, X, CheckCircle } from 'lucide-react';
import { ProductSpecification, ProductType, ProductVariant, ProductMedia, ProductVideo } from '../../../../types';
import { SpecificationTable } from '../components/SpecificationTable';

interface SpecsStepProps {
  specifications: ProductSpecification[];
  datasheetFile: File | string | null;
  featured: boolean;
  onSpecificationsChange: (specs: ProductSpecification[]) => void;
  onDatasheetChange: (file: File | string | null) => void;
  onFeaturedChange: (featured: boolean) => void;
  // Para resumo
  productName: string;
  productType: ProductType;
  category: string;
  price: number;
  stock: number;
  variants: ProductVariant[];
  coverImage: string | File | null;
  gallery: ProductMedia[];
  videos: ProductVideo[];
}

export function SpecsStep({
  specifications,
  datasheetFile,
  featured,
  onSpecificationsChange,
  onDatasheetChange,
  onFeaturedChange,
  // Resumo
  productName,
  productType,
  category,
  price,
  stock,
  variants,
  coverImage,
  gallery,
  videos,
}: SpecsStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDatasheetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onDatasheetChange(file);
    }
  };

  // Calcular estatísticas
  const totalStock = productType === 'variable'
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : stock;

  const activeVariants = variants.filter((v) => v.isActive).length;
  const lowestPrice = productType === 'variable' && variants.length > 0
    ? Math.min(...variants.map((v) => v.price))
    : price;

  const hasAllRequired = productName && category && coverImage && (
    productType === 'simple' ? price > 0 : variants.length > 0
  );

  return (
    <div className="space-y-8">
      {/* Especificações */}
      <SpecificationTable
        specifications={specifications}
        onChange={onSpecificationsChange}
      />

      {/* Separador */}
      <hr className="border-neutral-100" />

      {/* Ficha Técnica PDF */}
      <div className="space-y-3">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
          Ficha Técnica (PDF)
        </label>

        {datasheetFile ? (
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">
                {typeof datasheetFile === 'string'
                  ? 'Ficha técnica carregada'
                  : datasheetFile.name}
              </p>
              <p className="text-xs text-neutral-500">
                {typeof datasheetFile === 'string'
                  ? 'Ficheiro existente'
                  : `${(datasheetFile.size / 1024).toFixed(1)} KB`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDatasheetChange(null)}
              className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-neutral-200 rounded-xl hover:border-orange-400 transition-colors flex items-center justify-center gap-2 text-neutral-500 hover:text-orange-600"
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Carregar PDF</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleDatasheetUpload}
        />
      </div>

      {/* Separador */}
      <hr className="border-neutral-100" />

      {/* Destacar */}
      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
        </label>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-orange-600" />
            <span className="font-black text-neutral-900">Destacar na Landing Page</span>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Este produto aparecerá na página inicial para todos os visitantes
          </p>
        </div>
      </div>

      {/* Separador */}
      <hr className="border-neutral-100" />

      {/* Resumo */}
      <div className="space-y-4">
        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Resumo do Produto
        </h3>

        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="p-4 flex gap-4">
            {/* Preview da imagem */}
            <div className="w-24 h-24 rounded-xl bg-neutral-200 overflow-hidden flex-shrink-0">
              {coverImage && (
                <img
                  src={typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Info básica */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-neutral-900 text-lg truncate">
                {productName || 'Sem nome'}
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="px-2 py-0.5 bg-neutral-200 text-neutral-600 text-xs font-bold rounded">
                  {category || 'Sem categoria'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded">
                  {productType === 'variable' ? 'Variável' : 'Simples'}
                </span>
                {featured && (
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs font-bold rounded flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Destaque
                  </span>
                )}
              </div>
              <p className="mt-2 text-xl font-black text-orange-600">
                {lowestPrice.toLocaleString()} Kz
                {productType === 'variable' && variants.length > 1 && (
                  <span className="text-sm font-medium text-neutral-500 ml-1">
                    (a partir de)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-px bg-neutral-200">
            <div className="bg-white p-3 text-center">
              <p className="text-xl font-black text-neutral-900">{totalStock}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Stock</p>
            </div>
            {productType === 'variable' ? (
              <div className="bg-white p-3 text-center">
                <p className="text-xl font-black text-neutral-900">{activeVariants}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">Variantes</p>
              </div>
            ) : (
              <div className="bg-white p-3 text-center">
                <p className="text-xl font-black text-neutral-900">1</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase">SKU</p>
              </div>
            )}
            <div className="bg-white p-3 text-center">
              <p className="text-xl font-black text-neutral-900">{gallery.length}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Fotos</p>
            </div>
            <div className="bg-white p-3 text-center">
              <p className="text-xl font-black text-neutral-900">{videos.length}</p>
              <p className="text-[10px] font-bold text-neutral-400 uppercase">Vídeos</p>
            </div>
          </div>
        </div>

        {!hasAllRequired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              Completa todos os campos obrigatórios antes de publicar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

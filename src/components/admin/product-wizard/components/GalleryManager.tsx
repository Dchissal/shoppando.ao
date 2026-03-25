import React, { useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Link, X, GripVertical } from 'lucide-react';
import { ProductMedia } from '../../../../types';

interface GalleryManagerProps {
  gallery: ProductMedia[];
  onChange: (gallery: ProductMedia[]) => void;
  maxImages?: number;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function GalleryManager({
  gallery,
  onChange,
  maxImages = 10,
}: GalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = maxImages - gallery.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const newItems: ProductMedia[] = filesToAdd.map((file, index) => ({
      id: generateId(),
      type: 'image' as const,
      url: URL.createObjectURL(file),
      sortOrder: gallery.length + index,
      _file: file, // Temporary reference for upload
    }));

    onChange([...gallery, ...newItems]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!urlValue.trim()) return;

    const newItem: ProductMedia = {
      id: generateId(),
      type: 'external',
      url: urlValue.trim(),
      sortOrder: gallery.length,
    };

    onChange([...gallery, newItem]);
    setUrlValue('');
    setShowUrlInput(false);
  };

  const handleRemove = (id: string) => {
    onChange(gallery.filter((item) => item.id !== id));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newGallery = [...gallery];
    const [draggedItem] = newGallery.splice(draggedIndex, 1);
    newGallery.splice(index, 0, draggedItem);

    // Update sort orders
    const reordered = newGallery.map((item, i) => ({
      ...item,
      sortOrder: i,
    }));

    onChange(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
          Galeria de Imagens
        </label>
        <span className="text-xs text-neutral-400">
          {gallery.length}/{maxImages} imagens
        </span>
      </div>

      {/* Grid de imagens */}
      <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
        {gallery.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-xl overflow-hidden bg-neutral-100 border-2 group cursor-move ${
              draggedIndex === index
                ? 'border-orange-500 opacity-50'
                : 'border-neutral-200 hover:border-orange-400'
            }`}
          >
            <img
              src={item.url}
              alt=""
              className="w-full h-full object-cover"
            />

            {/* Overlay com ações */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <div className="absolute top-1 left-1">
                <GripVertical className="w-4 h-4 text-white/80" />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Badge de tipo */}
            {item.type === 'external' && (
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[8px] font-bold rounded">
                URL
              </div>
            )}

            {/* Número de ordem */}
            <div className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {index + 1}
            </div>
          </div>
        ))}

        {/* Botão adicionar */}
        {gallery.length < maxImages && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-neutral-200 hover:border-orange-400 cursor-pointer flex flex-col items-center justify-center gap-1 text-neutral-400 hover:text-orange-600 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] font-bold">Adicionar</span>
          </div>
        )}
      </div>

      {/* Input de ficheiros */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Adicionar por URL */}
      {gallery.length < maxImages && (
        <div className="space-y-2">
          {showUrlInput ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                />
              </div>
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-4 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
              >
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUrlInput(false);
                  setUrlValue('');
                }}
                className="p-2.5 bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-600 transition-colors"
            >
              <Link className="w-4 h-4" />
              Adicionar imagem por URL
            </button>
          )}
        </div>
      )}

      {gallery.length > 1 && (
        <p className="text-xs text-neutral-400">
          Arrasta as imagens para reordenar. A primeira imagem será usada como capa.
        </p>
      )}
    </div>
  );
}

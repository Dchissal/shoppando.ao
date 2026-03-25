import React, { useRef } from 'react';
import { Image as ImageIcon, Upload, X, Link } from 'lucide-react';

interface ImageUploaderProps {
  value: string | File | null;
  onChange: (value: File | string | null) => void;
  label?: string;
  required?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3';
  showUrlInput?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  label = 'Imagem',
  required = false,
  aspectRatio = 'square',
  showUrlInput = false,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrlField, setShowUrlField] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');

  const aspectClasses = {
    square: 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
  };

  const getPreviewUrl = (): string | null => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    return URL.createObjectURL(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onChange(urlValue.trim());
      setUrlValue('');
      setShowUrlField(false);
    }
  };

  const handleClear = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        className={`relative group ${aspectClasses[aspectRatio]} rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 overflow-hidden hover:border-orange-400 transition-colors`}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-400">
            <ImageIcon className="w-10 h-10" />
            <span className="text-xs font-bold">Carregar Imagem</span>
            <span className="text-[10px] text-neutral-300">ou arrasta aqui</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {showUrlInput && !previewUrl && (
        <div className="flex gap-2">
          {showUrlField ? (
            <>
              <input
                type="url"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-3 py-2 bg-orange-600 text-white text-sm font-bold rounded-xl hover:bg-orange-700"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => setShowUrlField(false)}
                className="px-3 py-2 bg-neutral-100 text-neutral-600 text-sm font-bold rounded-xl hover:bg-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlField(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-500 hover:text-orange-600 transition-colors"
            >
              <Link className="w-4 h-4" />
              Usar link externo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

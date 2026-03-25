import React from 'react';
import { ImageUploader } from '../components/ImageUploader';
import { GalleryManager } from '../components/GalleryManager';
import { VideoLinkInput } from '../components/VideoLinkInput';
import { ProductMedia, ProductVideo } from '../../../../types';

interface MediaStepProps {
  coverImage: string | File | null;
  gallery: ProductMedia[];
  videos: ProductVideo[];
  onCoverChange: (value: File | string | null) => void;
  onGalleryChange: (gallery: ProductMedia[]) => void;
  onVideosChange: (videos: ProductVideo[]) => void;
}

export function MediaStep({
  coverImage,
  gallery,
  videos,
  onCoverChange,
  onGalleryChange,
  onVideosChange,
}: MediaStepProps) {
  return (
    <div className="space-y-8">
      {/* Imagem de Capa */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ImageUploader
            value={coverImage}
            onChange={onCoverChange}
            label="Imagem de Capa"
            required
            showUrlInput
          />
          <p className="text-xs text-neutral-400 mt-2 ml-1">
            Esta é a imagem principal que aparece na listagem de produtos.
          </p>
        </div>

        <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl p-4 border border-neutral-200">
          <h4 className="font-bold text-neutral-900 mb-2">Dicas para Fotos</h4>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span>Usa fundo branco ou neutro para destaque</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span>Resolução mínima recomendada: 800x800px</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span>Mostra o produto de vários ângulos na galeria</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
              <span>Formatos aceites: JPG, PNG, WebP</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Separador */}
      <hr className="border-neutral-100" />

      {/* Galeria */}
      <GalleryManager
        gallery={gallery}
        onChange={onGalleryChange}
        maxImages={10}
      />

      {/* Separador */}
      <hr className="border-neutral-100" />

      {/* Vídeos */}
      <VideoLinkInput
        videos={videos}
        onChange={onVideosChange}
        maxVideos={5}
      />
    </div>
  );
}

import React from 'react';
import { Youtube, Plus, Trash2, ExternalLink } from 'lucide-react';
import { ProductVideo } from '../../../../types';

interface VideoLinkInputProps {
  videos: ProductVideo[];
  onChange: (videos: ProductVideo[]) => void;
  maxVideos?: number;
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function VideoLinkInput({
  videos,
  onChange,
  maxVideos = 5,
}: VideoLinkInputProps) {
  const [newUrl, setNewUrl] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleAddVideo = () => {
    setError(null);

    if (!newUrl.trim()) {
      setError('Insere um link do YouTube');
      return;
    }

    const videoId = extractYouTubeId(newUrl);
    if (!videoId) {
      setError('Link do YouTube inválido');
      return;
    }

    if (videos.some((v) => extractYouTubeId(v.youtubeUrl) === videoId)) {
      setError('Este vídeo já foi adicionado');
      return;
    }

    const newVideo: ProductVideo = {
      id: generateId(),
      youtubeUrl: newUrl.trim(),
      title: '',
    };

    onChange([...videos, newVideo]);
    setNewUrl('');
  };

  const handleRemoveVideo = (id: string) => {
    onChange(videos.filter((v) => v.id !== id));
  };

  const handleUpdateTitle = (id: string, title: string) => {
    onChange(videos.map((v) => (v.id === id ? { ...v, title } : v)));
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-black text-neutral-400 uppercase tracking-widest">
        Vídeos YouTube
      </label>

      {/* Lista de vídeos */}
      {videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((video) => {
            const videoId = extractYouTubeId(video.youtubeUrl);
            const thumbnail = videoId ? getYouTubeThumbnail(videoId) : null;

            return (
              <div
                key={video.id}
                className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
              >
                {thumbnail && (
                  <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200">
                    <img
                      src={thumbnail}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Youtube className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={video.title}
                    onChange={(e) => handleUpdateTitle(video.id, e.target.value)}
                    placeholder="Título do vídeo (opcional)"
                    className="w-full px-2.5 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-orange-600"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Abrir no YouTube
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveVideo(video.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Input para novo vídeo */}
      {videos.length < maxVideos && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setError(null);
                }}
                placeholder="https://youtube.com/watch?v=..."
                className={`w-full pl-10 pr-4 py-2.5 bg-neutral-50 border rounded-xl text-sm focus:border-orange-500 outline-none ${
                  error ? 'border-red-300' : 'border-neutral-200'
                }`}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVideo()}
              />
            </div>
            <button
              type="button"
              onClick={handleAddVideo}
              className="px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          {error && <p className="text-xs text-red-500 ml-1">{error}</p>}

          <p className="text-xs text-neutral-400 ml-1">
            {videos.length}/{maxVideos} vídeos
          </p>
        </div>
      )}
    </div>
  );
}

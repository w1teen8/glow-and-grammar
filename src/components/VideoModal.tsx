"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";

// Plays a lesson recording right on the page instead of sending the user
// off to YouTube — falls back to a plain link for non-YouTube URLs.
export default function VideoModal({ url, onClose }: { url: string; onClose: () => void }) {
  const embedUrl = getYouTubeEmbedUrl(url);

  return (
    <div
      className="fixed inset-0 z-30 flex animate-fade-in items-center justify-center bg-olive-900/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl animate-scale-in overflow-hidden rounded-xl2 bg-black shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between bg-olive-900 px-4 py-2">
          <span className="text-sm font-medium text-cream">Запис уроку</span>
          <button onClick={onClose} className="text-cream/80 hover:text-cream">
            ✕
          </button>
        </div>
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title="Запис уроку"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="p-8 text-center">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-pink-300 underline decoration-pink-500 underline-offset-2"
            >
              Відкрити запис уроку →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

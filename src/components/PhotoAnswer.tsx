"use client";

import { useState } from "react";

export default function PhotoAnswer({
  homeworkId,
  photos,
  disabled,
  onChanged,
}: {
  homeworkId: string;
  photos: { id: string; url: string }[];
  disabled?: boolean;
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/homework/${homeworkId}/photos`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("upload failed");
      }
      onChanged();
    } catch {
      setError("Не вдалося завантажити одне з фото. Спробуйте ще раз.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(photoId: string) {
    setDeletingId(photoId);
    await fetch(`/api/homework/${homeworkId}/photos/${photoId}`, { method: "DELETE" });
    setDeletingId(null);
    onChanged();
  }

  if (photos.length === 0 && disabled) {
    return <p className="text-sm text-olive-300">Фото немає.</p>;
  }

  return (
    <div className="space-y-3">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-olive/15">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <a href={photo.url} target="_blank" rel="noreferrer">
                <img src={photo.url} alt="Фото відповіді" className="h-28 w-full object-cover" />
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={deletingId === photo.id}
                  className="absolute right-1 top-1 rounded-full bg-olive-900/70 px-2 py-0.5 text-xs text-cream opacity-0 transition group-hover:opacity-100 disabled:opacity-60"
                >
                  {deletingId === photo.id ? "…" : "✕"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-olive/30 px-4 py-2 text-xs text-olive-600 hover:bg-olive/10">
            {uploading ? "Завантаження…" : "+ Додати фото"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

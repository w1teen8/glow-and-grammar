"use client";

import { useRef, useState } from "react";

export default function AudioRecorder({
  homeworkId,
  kind,
  existingUrl,
  disabled,
  onUploaded,
}: {
  homeworkId: string;
  kind: "answer" | "feedback";
  existingUrl: string | null;
  disabled?: boolean;
  onUploaded: () => void;
}) {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setBlobUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Не вдалося отримати доступ до мікрофона. Перевірте дозволи браузера.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function discard() {
    setBlobUrl(null);
  }

  async function submit() {
    if (!blobUrl) return;
    setUploading(true);
    setError(null);
    try {
      const blob = await fetch(blobUrl).then((r) => r.blob());
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("kind", kind);
      const res = await fetch(`/api/homework/${homeworkId}/audio`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "upload failed");
      }
      setBlobUrl(null);
      onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося завантажити запис. Спробуйте ще раз.");
    } finally {
      setUploading(false);
    }
  }

  async function removeExisting() {
    setDeleting(true);
    setError(null);
    try {
      const field = kind === "answer" ? "audioUrl" : "feedbackAudioUrl";
      const res = await fetch(`/api/homework/${homeworkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: null }),
      });
      if (!res.ok) throw new Error("delete failed");
      onUploaded();
    } catch {
      setError("Не вдалося видалити запис. Спробуйте ще раз.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-3">
      {existingUrl && (
        <div>
          <p className="mb-1 text-xs text-olive-400">Збережений запис:</p>
          <audio controls src={existingUrl} className="w-full" />
          {!disabled && (
            <button
              type="button"
              onClick={removeExisting}
              disabled={deleting}
              className="mt-1.5 text-xs text-rose-500 underline decoration-rose-300 hover:text-rose-700 disabled:opacity-50"
            >
              {deleting ? "Видалення…" : "Видалити запис"}
            </button>
          )}
        </div>
      )}

      {disabled ? (
        !existingUrl && <p className="text-sm text-olive-300">Запис недоступний.</p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          {!recording && !blobUrl && (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              Record Audio Answer
            </button>
          )}

          {recording && (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-full bg-olive-700 px-5 py-2.5 text-sm font-medium text-cream shadow-soft"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-300" />
              Зупинити запис
            </button>
          )}

          {blobUrl && !recording && (
            <>
              <audio controls src={blobUrl} className="max-w-xs" />
              <button
                type="button"
                onClick={submit}
                disabled={uploading}
                className="rounded-full bg-pink px-5 py-2.5 text-sm font-medium text-olive-900 shadow-soft disabled:opacity-60"
              >
                {uploading ? "Завантаження…" : "Надіслати"}
              </button>
              <button
                type="button"
                onClick={discard}
                disabled={uploading}
                className="text-sm text-olive-400 underline hover:text-olive-600"
              >
                Перезаписати
              </button>
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
}

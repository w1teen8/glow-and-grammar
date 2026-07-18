"use client";

import { useState } from "react";

// Shows a freshly-reset password exactly once — it is never retrievable
// again after this modal closes, since only its bcrypt hash is stored.
export default function StudentCredentialsModal({
  name,
  email,
  password,
  onClose,
}: {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    await navigator.clipboard.writeText(`Email: ${email}\nПароль: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-30 flex animate-fade-in items-center justify-center bg-olive-900/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-scale-in rounded-xl2 border border-olive/15 bg-cream p-6 shadow-card">
        <h2 className="mb-1 font-display text-xl font-semibold text-olive-900">Новий пароль для {name}</h2>
        <p className="mb-5 text-sm text-olive-500">
          Збережіть або скопіюйте зараз — після закриття вікна пароль більше ніде не буде видно.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-olive/20 bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-olive-400">Email</p>
            <p className="font-medium text-olive-800">{email}</p>
          </div>
          <div className="rounded-lg border border-olive/20 bg-white px-3 py-2">
            <p className="text-[11px] uppercase tracking-wide text-olive-400">Пароль</p>
            <p className="font-mono text-base font-semibold tracking-wide text-olive-900">{password}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-full border border-olive/30 px-5 py-2 text-sm text-olive-700 transition hover:bg-olive/10"
          >
            Закрити
          </button>
          <button
            onClick={copyAll}
            className="rounded-full bg-pink px-5 py-2 text-sm font-medium text-olive-900 shadow-soft transition hover:brightness-95"
          >
            {copied ? "Скопійовано ✓" : "Копіювати"}
          </button>
        </div>
      </div>
    </div>
  );
}

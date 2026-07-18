"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });

    setLoading(false);
    if (res?.error) {
      setError("Невірний email або пароль.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-block text-xs font-medium text-olive-400 underline hover:text-olive-600"
      >
        ← На головну
      </Link>
      <form onSubmit={handleSubmit}>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-olive-300">Вхід</p>

        <label className="mb-1 block text-sm font-medium text-olive-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-olive/20 px-4 py-2.5 text-olive-900 outline-none transition focus:border-olive"
          placeholder="you@example.com"
        />

        <label className="mb-1 block text-sm font-medium text-olive-700">Пароль</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-2 w-full rounded-lg border border-olive/20 px-4 py-2.5 text-olive-900 outline-none transition focus:border-olive"
          placeholder="••••••••"
        />

        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          className="mb-2 text-xs font-medium text-olive-400 underline decoration-olive-300 underline-offset-2 hover:text-olive-600"
        >
          Забули пароль?
        </button>

        {showForgot && (
          <p className="mb-3 animate-scale-in rounded-lg border border-pink/30 bg-pink-50 px-3 py-2.5 text-xs leading-relaxed text-olive-600">
            Напишіть своєму викладачу — він видасть вам новий пароль для входу.
          </p>
        )}

        {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-pink py-2.5 font-medium text-olive-900 shadow-soft transition hover:brightness-95 disabled:opacity-60"
        >
          {loading ? "Вхід..." : "Увійти"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-olive-300">
        Немає облікового запису?{" "}
        <Link href="/register" className="text-olive-500 underline hover:text-olive-700">
          Дізнатись, як отримати доступ
        </Link>
      </p>
    </div>
  );
}

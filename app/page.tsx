"use client";

import { useState, FormEvent } from "react";

type Result = {
  code: string;
  shortUrl: string;
  target: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [showAlias, setShowAlias] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          alias: alias.trim() ? alias.trim() : undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        return;
      }

      setResult(data);
    } catch {
      setError("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-wire" />
          <span className="font-mono text-xs tracking-[0.2em] text-ink/60 uppercase">
            Splice · Pemendek Tautan
          </span>
        </div>

        {/* Signature: long wire resolving into short wire */}
        <svg
          viewBox="0 0 560 90"
          className="w-full h-auto mb-8"
          aria-hidden="true"
        >
          <path
            d="M20 45 C 60 10, 100 80, 140 45 S 220 10, 260 45"
            fill="none"
            stroke="#12151A"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="280" cy="45" r="5" fill="#E8B04B" />
          <line
            x1="320"
            y1="45"
            x2="540"
            y2="45"
            stroke="#2A6F63"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="540" cy="45" r="5" fill="#2A6F63" />
        </svg>

        <h1 className="font-sans text-3xl sm:text-4xl font-semibold text-center leading-tight mb-3">
          Tautan panjang, jadi{" "}
          <span className="text-wire">satu baris</span>.
        </h1>
        <p className="text-center text-ink/60 mb-10 font-mono text-sm">
          Tempel URL-nya. Dapat tautan pendeknya.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              inputMode="url"
              placeholder="https://contoh.com/artikel/yang-sangat-panjang-sekali"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 font-mono text-sm bg-paper border-2 border-ink/15 focus:border-wire outline-none rounded-lg px-4 py-3 placeholder:text-ink/30 transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="font-mono text-sm font-medium bg-ink text-paper rounded-lg px-6 py-3 hover:bg-wire transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Memendekkan…" : "Pendekkan"}
            </button>
          </div>

          {showAlias ? (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-ink/40 whitespace-nowrap">
                {typeof window !== "undefined" ? window.location.host : ""}/
              </span>
              <input
                type="text"
                placeholder="nama-kustom-saya"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                pattern="[a-zA-Z0-9_-]{3,32}"
                maxLength={32}
                className="flex-1 font-mono text-sm bg-paper border-2 border-ink/15 focus:border-wire outline-none rounded-lg px-3 py-2 placeholder:text-ink/30 transition-colors"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAlias(true)}
              className="self-start font-mono text-xs text-ink/50 hover:text-wire underline underline-offset-2 transition-colors"
            >
              + pakai alias kustom
            </button>
          )}
        </form>

        <div className="mt-3 text-center">
          <a
            href="/links"
            className="font-mono text-xs text-ink/40 hover:text-wire underline underline-offset-2 transition-colors"
          >
            lihat semua link yang pernah dibuat →
          </a>
        </div>

        {error && (
          <div className="mt-4 font-mono text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 border-2 border-wire/30 bg-wireLight/60 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs text-ink/50 mb-1">
                tautan pendek Anda
              </p>
              <a
                href={result.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-base font-medium text-wire hover:underline truncate block"
              >
                {result.shortUrl}
              </a>
            </div>
            <button
              onClick={handleCopy}
              className="shrink-0 font-mono text-xs font-medium bg-ink text-paper rounded-md px-4 py-2 hover:bg-wire transition-colors"
            >
              {copied ? "Tersalin ✓" : "Salin"}
            </button>
          </div>
        )}

        <p className="mt-12 text-center font-mono text-xs text-ink/35">
          v0.2 · alias kustom &amp; riwayat publik
        </p>
      </div>
    </main>
  );
}

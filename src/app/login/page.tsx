"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Log masuk gagal");
        return;
      }
      const redirectTarget = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirectTarget?.startsWith("/") ? redirectTarget : "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#201e1d] p-4 sm:p-6">
      <div className="relative w-full max-w-[420px] bg-[#f3f2f2] p-6 px-5 sm:p-10 sm:px-[34px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/mpc-logo.png" alt="Perbadanan Produktiviti Malaysia" className="mx-auto mb-4 h-auto w-[190px]" />
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center bg-[var(--accent)] font-archivo text-sm font-extrabold text-[#f3f2f2]">
            SRO
          </div>
          <div className="font-archivo text-[13px] font-extrabold leading-[1.3] tracking-[-0.005em]">
            PERBADANAN PRODUKTIVITI MALAYSIA
            <br />
            WILAYAH SELATAN
          </div>
        </div>
        <div className="mb-2 text-[13px] text-[rgba(32,30,29,0.6)]">
          Sistem Pengurusan Penempahan Fasiliti &amp; Penyelenggaraan Kampus
        </div>
        <div className="mb-[26px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-[5px] block text-xs text-[rgba(32,30,29,0.7)]">Email / Username</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ahmad.faiz@kampus.edu.my"
              className="min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-white px-2.5 py-1.5 text-sm text-[#201e1d] outline-none"
            />
          </div>
          <div>
            <label className="mb-[5px] block text-xs text-[rgba(32,30,29,0.7)]">Kata Laluan</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-white px-2.5 py-1.5 text-sm text-[#201e1d] outline-none"
            />
          </div>

          {error && <div className="bg-[#fff2ef] px-3 py-2 text-sm text-[#7c1405]">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 bg-[var(--accent)] py-[11px] text-left font-archivo text-sm font-extrabold text-[#f3f2f2] transition hover:bg-[var(--accent-dark)] disabled:opacity-60"
          >
            {loading ? "Log masuk..." : "Log Masuk"}
          </button>

          <div className="-mt-1 flex items-center justify-between text-[12.5px]">
            <label className="flex cursor-pointer items-center gap-1.5 text-[rgba(32,30,29,0.75)]">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Ingat Saya
            </label>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="font-bold text-[var(--accent)] hover:underline"
            >
              Lupa Kata Laluan?
            </button>
          </div>

          <div className="mt-0.5 text-[13px] text-[rgba(32,30,29,0.7)]">
            Belum ada akaun?{" "}
            <Link href="/register" className="font-bold text-[var(--accent)] hover:underline">
              Daftar
            </Link>
          </div>
        </form>

        {forgotOpen && (
          <div className="absolute inset-0 flex flex-col justify-center bg-[rgba(243,242,242,0.97)] p-6 px-5 sm:p-10 sm:px-[34px]">
            <div className="mb-2 font-archivo text-lg font-extrabold">Lupa Kata Laluan?</div>
            <div className="mb-[18px] text-[13px] text-[rgba(32,30,29,0.7)]">
              Masukkan emel anda — pautan set semula kata laluan akan dihantar.
            </div>
            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit}>
                <label className="mb-[5px] block text-xs text-[rgba(32,30,29,0.7)]">Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="nama@kampus.edu.my"
                  className="mb-4 min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-white px-2.5 py-1.5 text-sm outline-none"
                />
                <div className="flex gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 bg-[var(--accent)] py-[11px] font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
                  >
                    Hantar Pautan
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="flex-1 border border-[rgba(32,30,29,0.4)] bg-transparent py-[11px] font-archivo text-[13.5px] font-extrabold text-[#201e1d]"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-4 text-sm text-[rgba(32,30,29,0.75)]">
                  Jika akaun dengan emel tersebut wujud, pautan set semula kata laluan telah dihantar.
                </div>
                <button
                  onClick={() => {
                    setForgotOpen(false);
                    setForgotSent(false);
                    setForgotEmail("");
                  }}
                  className="w-full bg-[var(--accent)] py-[11px] font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
                >
                  OK
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-[12.5px] text-[rgba(32,30,29,0.6)]">
          <Link href="/" className="font-bold text-[var(--accent)] hover:underline">
            Kembali ke Laman Utama
          </Link>
          {" · "}
          <Link href="/aduan-awam" className="font-bold text-[var(--accent)] hover:underline">
            Buat Aduan Tanpa Log Masuk
          </Link>
        </div>
        <div className="absolute bottom-2 right-2.5 text-[11.5px] text-[rgba(32,30,29,0.45)]">❤️ SRO</div>
      </div>
    </div>
  );
}

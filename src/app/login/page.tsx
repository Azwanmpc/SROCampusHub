"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Log masuk gagal");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-700 text-sm font-extrabold text-white">
            SRO
          </div>
          <div className="text-sm font-bold leading-tight text-slate-800">
            PERBADANAN PRODUKTIVITI MALAYSIA
            <br />
            WILAYAH SELATAN
          </div>
        </div>
        <p className="mb-6 text-sm text-slate-500">
          Sistem Pengurusan Penempahan Fasiliti &amp; Penyelenggaraan Kampus
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Email / Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ahmad.faiz@kampus.edu.my"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Kata Laluan
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-indigo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
          >
            {loading ? "Log masuk..." : "Log Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum ada akaun?{" "}
          <Link href="/register" className="font-semibold text-indigo-700 hover:underline">
            Daftar di sini
          </Link>
        </p>

        <div className="mt-6 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
          <p className="mb-1 font-semibold">Akaun demo:</p>
          <p>Superadmin: superadmin / super123</p>
          <p>Admin: admin1 / admin123</p>
          <p>Pemohon: ahmad.faiz / pemohon123</p>
          <p>Pengadu: siti.aminah / pengadu123</p>
        </div>
      </div>
    </div>
  );
}

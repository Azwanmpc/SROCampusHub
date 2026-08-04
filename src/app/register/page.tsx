"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "PEMOHON",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Pendaftaran gagal");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-white px-2.5 py-1.5 text-sm text-[#201e1d] outline-none";
  const labelClass = "mb-[5px] block text-xs text-[rgba(32,30,29,0.7)]";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#201e1d] p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-[#f3f2f2] p-6 px-5 sm:p-10 sm:px-[34px]">
        <div className="mb-2 flex items-center gap-2.5">
          <div className="flex h-[38px] w-[38px] flex-none items-center justify-center bg-[#6d28d9] font-archivo text-sm font-extrabold text-[#f3f2f2]">
            SRO
          </div>
          <div className="font-archivo text-[13px] font-extrabold leading-[1.3] tracking-[-0.005em]">
            PERBADANAN PRODUKTIVITI MALAYSIA
            <br />
            WILAYAH SELATAN
          </div>
        </div>
        <div className="mb-2 text-[13px] text-[rgba(32,30,29,0.6)]">Daftar Akaun Baharu</div>
        <div className="mb-[26px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Nama Penuh</label>
            <input
              required
              placeholder="Nama seperti IC"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              placeholder="nama@kampus.edu.my"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Username</label>
              <input required value={form.username} onChange={(e) => update("username", e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input
                required
                placeholder="60123456789"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Kata Laluan</label>
            <input
              type="password"
              required
              placeholder="********"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className={fieldClass}
            />
          </div>
          {error && <div className="bg-[#fff2ef] px-3 py-2 text-sm text-[#7c1405]">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 bg-[#6d28d9] py-[11px] text-left font-archivo text-sm font-extrabold text-[#f3f2f2] hover:bg-[#4c1d95] disabled:opacity-60"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>

          <div className="text-[13px] text-[rgba(32,30,29,0.7)]">
            Sudah ada akaun?{" "}
            <Link href="/login" className="font-bold text-[#6d28d9] hover:underline">
              Log Masuk
            </Link>
          </div>
          <div className="text-[13px] text-[rgba(32,30,29,0.7)]">
            Nak buat aduan kerosakan sahaja?{" "}
            <Link href="/aduan-awam" className="font-bold text-[#6d28d9] hover:underline">
              Tiada perlu daftar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

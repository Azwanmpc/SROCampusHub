"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
import { ROLE_LABEL } from "@/lib/constants";

type User = {
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  jawatan: string | null;
  role: string;
  active: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UserManagement({ users }: { users: User[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    phone: "",
    jawatan: "",
    password: "",
    role: "PEMOHON",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fieldClass = "border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm outline-none";

  async function updateUser(id: string, patch: Partial<Pick<User, "role" | "active" | "jawatan">>) {
    await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function handleDelete(u: User) {
    if (!confirm(`Padam akaun ${u.name}? Tindakan ini tidak boleh dibatalkan.`)) return;
    setDeleteError("");
    const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      setDeleteError(data.error ?? "Gagal memadam pengguna");
      return;
    }
    router.refresh();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mencipta pengguna");
        return;
      }
      setForm({ name: "", email: "", username: "", phone: "", jawatan: "", password: "", role: "PEMOHON" });
      setShowForm(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="font-archivo text-sm font-extrabold">Senarai Pengguna ({users.length})</div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-[#6d28d9] px-3.5 py-2 font-archivo text-xs font-extrabold text-[#f3f2f2]"
        >
          {showForm ? "Tutup" : "+ Tambah Pengguna"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-5 grid grid-cols-1 gap-3 border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-4 sm:grid-cols-2">
          <input required placeholder="Nama Penuh" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={fieldClass} />
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={fieldClass} />
          <input required placeholder="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className={fieldClass} />
          <input placeholder="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={fieldClass} />
          <input placeholder="Jawatan" value={form.jawatan} onChange={(e) => setForm((f) => ({ ...f, jawatan: e.target.value }))} className={fieldClass} />
          <input required type="password" placeholder="Kata Laluan" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className={fieldClass} />
          <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={fieldClass}>
            {Object.entries(ROLE_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {error && <div className="col-span-2 bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger)]">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="col-span-2 bg-[#6d28d9] py-2.5 font-archivo text-sm font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            {loading ? "Mencipta..." : "Cipta Pengguna"}
          </button>
        </form>
      )}

      {deleteError && <div className="mb-3 bg-[var(--danger-bg)] px-3 py-2 text-xs text-[var(--danger)]">{deleteError}</div>}

      <div className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)]">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3.5 border-b border-[rgba(var(--ink-rgb),0.2)] p-3.5 last:border-0">
            <div className="flex h-[38px] w-[38px] flex-none items-center justify-center bg-[#201e1d] text-xs font-bold text-[#f3f2f2]">
              {initials(u.name)}
            </div>
            <div className="min-w-[150px] flex-1">
              <div className="text-[13.5px] font-bold">{u.name}</div>
              <div className="text-xs text-[rgba(var(--ink-rgb),0.6)]">{u.email}</div>
            </div>
            <input
              key={u.jawatan ?? ""}
              defaultValue={u.jawatan ?? ""}
              placeholder="Jawatan"
              onBlur={(e) => {
                if (e.target.value !== (u.jawatan ?? "")) updateUser(u.id, { jawatan: e.target.value });
              }}
              className="w-[140px] border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-2 py-1 text-xs outline-none"
            />
            <select
              value={u.role}
              onChange={(e) => updateUser(u.id, { role: e.target.value })}
              className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2 py-1 text-xs font-bold"
            >
              {Object.entries(ROLE_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={() => updateUser(u.id, { active: !u.active })}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] ${
                u.active ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[#eae7e7] text-[#605d5d]"
              }`}
            >
              {u.active ? "Aktif" : "Tidak Aktif"}
            </button>
            <button
              onClick={() => handleDelete(u)}
              title="Padam akaun"
              className="flex items-center gap-1 border border-[#7c1405] px-2.5 py-1 text-[11px] font-bold text-[var(--danger)] hover:bg-[var(--danger-bg)]"
            >
              <Trash weight="duotone" size={13} /> Padam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

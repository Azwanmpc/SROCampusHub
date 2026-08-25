"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple } from "@phosphor-icons/react";

type Addon = { id: string; key: string; label: string; appliesTo: string[]; half: number; full: number };

function fmtRM(n: number) {
  return `RM ${n.toLocaleString("ms-MY")}`;
}

export default function EquipmentAddonList({ addons, isStaff }: { addons: Addon[]; isStaff: boolean }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [half, setHalf] = useState("");
  const [full, setFull] = useState("");
  const [saving, setSaving] = useState(false);

  function startEdit(a: Addon) {
    setEditingId(a.id);
    setHalf(String(a.half));
    setFull(String(a.full));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSave(id: string) {
    setSaving(true);
    try {
      await fetch(`/api/equipment-addons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ half: Number(half) || 0, full: Number(full) || 0 }),
      });
      cancelEdit();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-px border border-[rgba(var(--ink-rgb),0.2)] bg-[rgba(var(--ink-rgb),0.2)]">
      {addons.map((a) => (
        <div key={a.id} className="bg-[var(--white)] p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[140px] flex-1">
              <div className="text-[13px] font-bold">{a.label}</div>
              <div className="text-[11px] text-[rgba(var(--ink-rgb),0.55)]">{a.appliesTo.join(", ")}</div>
            </div>
            <div className="text-[12.5px] font-semibold">
              Separuh: <span className="font-bold text-[var(--accent)]">{fmtRM(a.half)}</span>
            </div>
            <div className="text-[12.5px] font-semibold">
              1 Hari: <span className="font-bold text-[var(--accent)]">{fmtRM(a.full)}</span>
            </div>
            {isStaff && editingId !== a.id && (
              <button
                onClick={() => startEdit(a)}
                className="flex items-center gap-1.5 border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-[12.5px] font-bold text-[var(--ink)]"
              >
                <PencilSimple weight="duotone" size={14} /> Ubah
              </button>
            )}
          </div>
          {editingId === a.id && (
            <div className="mt-2.5 flex flex-wrap items-end gap-2.5 border-t border-[rgba(var(--ink-rgb),0.15)] pt-2.5">
              <div>
                <label className="mb-1 block text-[10.5px] text-[rgba(var(--ink-rgb),0.6)]">Separuh Hari (RM)</label>
                <input
                  type="number"
                  value={half}
                  onChange={(e) => setHalf(e.target.value)}
                  className="w-28 border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10.5px] text-[rgba(var(--ink-rgb),0.6)]">1 Hari (RM)</label>
                <input
                  type="number"
                  value={full}
                  onChange={(e) => setFull(e.target.value)}
                  className="w-28 border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
                />
              </div>
              <button
                onClick={() => handleSave(a.id)}
                disabled={saving}
                className="bg-[var(--accent)] px-3.5 py-1.5 font-archivo text-xs font-extrabold text-white disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button onClick={cancelEdit} className="border border-[rgba(var(--ink-rgb),0.4)] px-3.5 py-1.5 font-archivo text-xs font-extrabold text-[var(--ink)]">
                Batal
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

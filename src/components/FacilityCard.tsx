"use client";

import { useState } from "react";
import { Users, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import StatusBadge from "@/components/StatusBadge";
import FacilityStatusSelect from "@/components/FacilityStatusSelect";
import FacilityEditModal from "@/components/FacilityEditModal";
import { FACILITY_STATUS_LABEL, FACILITY_STATUS_COLOR } from "@/lib/constants";

type Facility = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description: string | null;
  status: string;
  costPerUse: number;
  halfDayRate: number | null;
  fullDayRate: number | null;
  imageUrl: string | null;
};

export default function FacilityCard({ facility: f, isStaff }: { facility: Facility; isStaff: boolean }) {
  const [editing, setEditing] = useState(false);
  const isAsrama = f.type === "Asrama";

  return (
    <div className="flex h-full flex-col border border-[rgba(32,30,29,0.3)] bg-white">
      {f.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={f.imageUrl} alt={f.name} className="h-[110px] w-full object-cover" />
      ) : (
        <div className="flex h-[110px] items-center justify-center bg-[repeating-linear-gradient(135deg,#e7e5e5_0_10px,#d7d3d3_10px_20px)] text-xs font-semibold text-[rgba(32,30,29,0.4)]">
          Gambar {f.name}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="text-[14.5px] font-bold">{f.name}</div>
          <StatusBadge label={FACILITY_STATUS_LABEL[f.status]} colorClass={FACILITY_STATUS_COLOR[f.status]} />
        </div>
        <div className="mb-2 text-[12.5px] text-[rgba(32,30,29,0.6)]">{f.description}</div>
        <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
          <Users weight="duotone" size={16} />
          {f.capacity} Pax
        </div>

        {isAsrama ? (
          <div className="mb-3 bg-[#f3f2f2] px-2.5 py-2">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
              Kadar Bilik
            </div>
            <div className="mt-0.5 text-xs">
              Suit Eksekutif: RM150/malam · Bilik Biasa: RM70/malam · Dorm: RM150/malam
            </div>
          </div>
        ) : f.halfDayRate != null ? (
          <div className="mb-3 flex gap-px border border-[rgba(32,30,29,0.15)] bg-[rgba(32,30,29,0.15)]">
            <div className="flex-1 bg-[#f3f2f2] px-2.5 py-2">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
                Separuh Hari
              </div>
              <div className="font-archivo text-sm font-extrabold">RM {f.halfDayRate.toLocaleString("ms-MY")}</div>
            </div>
            <div className="flex-1 bg-[#f3f2f2] px-2.5 py-2">
              <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
                Satu Hari
              </div>
              <div className="font-archivo text-sm font-extrabold">RM {(f.fullDayRate ?? f.costPerUse).toLocaleString("ms-MY")}</div>
            </div>
          </div>
        ) : null}

        {isStaff && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <FacilityStatusSelect facilityId={f.id} status={f.status} />
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 border border-[rgba(32,30,29,0.4)] px-2.5 py-1.5 text-[12.5px] font-bold text-[#201e1d]"
            >
              <PencilSimple weight="duotone" size={14} /> Ubah
            </button>
          </div>
        )}
      </div>

      {editing && <FacilityEditModal facility={f} onClose={() => setEditing(false)} />}
    </div>
  );
}

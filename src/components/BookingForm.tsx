"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "@phosphor-icons/react";
import { ARRANGEMENT_LABEL } from "@/lib/constants";
import { ASRAMA_ROOM_TYPES, addonsForFacility } from "@/lib/facilityRates";

const ARRANGEMENT_ELIGIBLE_FACILITIES = ["Bilik ICC", "Bilik TQM", "Dewan Produktiviti"];

type Facility = {
  id: string;
  name: string;
  type: string;
  status: string;
  halfDayRate: number | null;
  fullDayRate: number | null;
  costPerUse: number;
};

function fmtRM(n: number) {
  return `RM ${n.toLocaleString("ms-MY")}`;
}

export default function BookingForm({
  facilities,
  defaultFacilityId,
  defaultDate,
  onDone,
}: {
  facilities: Facility[];
  defaultFacilityId?: string;
  defaultDate?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [facilityId, setFacilityId] = useState(defaultFacilityId ?? facilities[0]?.id ?? "");
  const [startDate, setStartDate] = useState(defaultDate ?? "");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(defaultDate ?? "");
  const [endTime, setEndTime] = useState("17:00");
  const [purpose, setPurpose] = useState("");
  const [participantCount, setParticipantCount] = useState(10);
  const [arrangement, setArrangement] = useState("TIADA");
  const [rateType, setRateType] = useState<"HALF" | "FULL">("FULL");
  const [roomQtys, setRoomQtys] = useState<Record<string, number>>({ EKSEKUTIF: 0, BIASA: 1, DORM: 0 });
  const [addons, setAddons] = useState<Record<string, { checked: boolean; qty: number; rateType: "HALF" | "FULL" }>>({});
  const [earlyAccess, setEarlyAccess] = useState(false);
  const [earlyAccessMinutes, setEarlyAccessMinutes] = useState(30);
  const [organisasi, setOrganisasi] = useState("");
  const [alamatOrganisasi, setAlamatOrganisasi] = useState("");
  const [sebutNama, setSebutNama] = useState("");
  const [sebutTel, setSebutTel] = useState("");
  const [sebutEmel, setSebutEmel] = useState("");
  const [notaTambahan, setNotaTambahan] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedFacility = facilities.find((f) => f.id === facilityId);
  const isAsrama = selectedFacility?.type === "Asrama";
  const arrangementEligible = selectedFacility ? ARRANGEMENT_ELIGIBLE_FACILITIES.includes(selectedFacility.name) : false;
  const supportsEarlyAccess =
    selectedFacility?.name?.includes("Dewan") ||
    selectedFacility?.name?.includes("ICC") ||
    selectedFacility?.name?.includes("TQM");
  const availableAddons = selectedFacility ? addonsForFacility(selectedFacility.name) : [];
  const [asramaAvailability, setAsramaAvailability] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (!arrangementEligible) setArrangement("TIADA");
  }, [arrangementEligible]);

  useEffect(() => {
    if (isAsrama) {
      setStartTime("14:00");
      setEndTime("12:00");
    }
  }, [isAsrama]);

  useEffect(() => {
    if (!isAsrama || !facilityId || !startDate || !endDate) {
      setAsramaAvailability(null);
      return;
    }
    const startISO = new Date(`${startDate}T00:00`).toISOString();
    const endISO = new Date(`${endDate}T23:59`).toISOString();
    let cancelled = false;
    fetch(`/api/bookings/availability?facilityId=${facilityId}&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAsramaAvailability(data);
      })
      .catch(() => {
        if (!cancelled) setAsramaAvailability(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isAsrama, facilityId, startDate, endDate]);

  const dayCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const days = Math.round((d2.getTime() - d1.getTime()) / 86400000) + 1;
    return days >= 1 ? days : 1;
  }, [startDate, endDate]);

  const facilityPrice = useMemo(() => {
    if (!selectedFacility) return 0;
    if (isAsrama) {
      return ASRAMA_ROOM_TYPES.reduce((sum, rt) => sum + rt.rate * (roomQtys[rt.key] || 0), 0) * dayCount;
    }
    const rate =
      rateType === "HALF" && selectedFacility.halfDayRate != null
        ? selectedFacility.halfDayRate
        : selectedFacility.fullDayRate ?? selectedFacility.costPerUse;
    return rate * dayCount;
  }, [selectedFacility, isAsrama, roomQtys, dayCount, rateType]);

  const addonsBreakdown = useMemo(
    () =>
      availableAddons
        .filter((a) => addons[a.key]?.checked)
        .map((a) => {
          const st = addons[a.key];
          const unit = st.rateType === "HALF" ? a.half : a.full;
          return { key: a.key, label: a.label, qty: st.qty, rateType: st.rateType, price: unit * st.qty };
        }),
    [availableAddons, addons]
  );

  const addonsTotal = addonsBreakdown.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = facilityPrice + addonsTotal;

  function toggleAddon(key: string) {
    setAddons((prev) => ({
      ...prev,
      [key]: prev[key]
        ? { ...prev[key], checked: !prev[key].checked }
        : { checked: true, qty: 1, rateType: "FULL" },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!startDate || !endDate) {
      setError("Sila pilih tarikh mula dan tamat");
      return;
    }
    if (isAsrama && Object.values(roomQtys).every((q) => !q)) {
      setError("Sila pilih sekurang-kurangnya satu jenis bilik untuk Asrama.");
      return;
    }
    if (isAsrama && asramaAvailability) {
      const overRequested = ASRAMA_ROOM_TYPES.find(
        (rt) => (roomQtys[rt.key] ?? 0) > (asramaAvailability[rt.key] ?? 0)
      );
      if (overRequested) {
        setError(`${overRequested.label} tidak mencukupi untuk tarikh yang dipilih.`);
        return;
      }
    }

    setLoading(true);
    try {
      const asramaRoomsBreakdown = isAsrama
        ? ASRAMA_ROOM_TYPES.filter((rt) => roomQtys[rt.key] > 0).map((rt) => ({
            key: rt.key,
            label: rt.label,
            qty: roomQtys[rt.key],
            price: rt.rate * roomQtys[rt.key] * dayCount,
          }))
        : [];

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId,
          startDateTime: new Date(`${startDate}T${startTime}`).toISOString(),
          endDateTime: new Date(`${endDate}T${endTime}`).toISOString(),
          purpose,
          participantCount,
          arrangement,
          rateType,
          addOnProjector: addons["lcd-projektor"]?.checked ? addons["lcd-projektor"].qty : 0,
          addOnTv100: addons["tv-lcd"]?.checked ? addons["tv-lcd"].qty : 0,
          earlyAccess,
          earlyAccessMinutes: earlyAccess ? earlyAccessMinutes : 0,
          roomNumber: isAsrama
            ? ASRAMA_ROOM_TYPES.filter((rt) => roomQtys[rt.key] > 0)
                .map((rt) => `${rt.label} x${roomQtys[rt.key]}`)
                .join(", ")
            : undefined,
          organisasi,
          alamatOrganisasi,
          sebutNama,
          sebutTel,
          sebutEmel,
          addonsJson: JSON.stringify(addonsBreakdown),
          asramaRoomsJson: JSON.stringify(asramaRoomsBreakdown),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Tempahan gagal");
        return;
      }
      setSuccess(true);
      setPurpose("");
      router.refresh();
      onDone?.();
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-2.5 py-1.5 text-sm outline-none";
  const labelClass = "mb-[5px] block text-xs text-[rgba(var(--ink-rgb),0.7)]";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <label className={labelClass}>Fasiliti</label>
        <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={fieldClass}>
          {facilities.map((f) => (
            <option key={f.id} value={f.id} disabled={f.status === "PENYELENGGARAAN"}>
              {f.name} {f.status === "PENYELENGGARAAN" ? "(Dalam Penyelenggaraan)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Tarikh Mula</label>
          <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Tarikh Tamat</label>
          <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className={fieldClass} />
        </div>
        {!isAsrama && (
          <>
            <div>
              <label className={labelClass}>Masa Mula</label>
              <input type="time" required value={startTime} onChange={(e) => setStartTime(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Masa Tamat</label>
              <input type="time" required value={endTime} onChange={(e) => setEndTime(e.target.value)} className={fieldClass} />
            </div>
          </>
        )}
      </div>

      {!isAsrama && selectedFacility?.halfDayRate != null && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRateType("HALF")}
            className={`flex-1 border py-2 text-xs font-bold ${rateType === "HALF" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)]"}`}
          >
            Separuh Hari ({fmtRM(selectedFacility.halfDayRate)})
          </button>
          <button
            type="button"
            onClick={() => setRateType("FULL")}
            className={`flex-1 border py-2 text-xs font-bold ${rateType === "FULL" ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)]"}`}
          >
            Satu Hari ({fmtRM(selectedFacility.fullDayRate ?? selectedFacility.costPerUse)})
          </button>
        </div>
      )}

      {isAsrama && (
        <div className="flex flex-col gap-2 border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--surface)] p-3">
          <div className="mb-1 text-xs font-bold text-[rgba(var(--ink-rgb),0.7)]">Bilangan Bilik</div>
          {(!startDate || !endDate) && (
            <div className="text-[11px] italic text-[rgba(var(--ink-rgb),0.55)]">
              Pilih tarikh mula &amp; tamat untuk lihat bilangan bilik yang masih tersedia.
            </div>
          )}
          {ASRAMA_ROOM_TYPES.map((rt) => {
            const available = asramaAvailability ? (asramaAvailability[rt.key] ?? 0) : rt.bilikTersedia;
            return (
              <div key={rt.key} className="flex items-center gap-2.5 bg-[var(--white)] px-2.5 py-1.5">
                <div className="flex-1">
                  <div className="text-[11.5px] font-bold">{rt.label}</div>
                  <div className="text-[10.5px] text-[rgba(var(--ink-rgb),0.6)]">
                    RM {rt.rate}/malam · {available} bilik tersedia
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  max={available}
                  value={roomQtys[rt.key] ?? 0}
                  onChange={(e) =>
                    setRoomQtys((prev) => ({ ...prev, [rt.key]: Math.min(Number(e.target.value), available) }))
                  }
                  className="w-16 border border-[rgba(var(--ink-rgb),0.4)] px-2 py-1 text-sm"
                />
              </div>
            );
          })}
        </div>
      )}

      <div>
        <label className={labelClass}>Tujuan</label>
        <input
          required
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Cth: Mesyuarat Jabatan"
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Bilangan Peserta</label>
          <input
            type="number"
            min={1}
            required
            value={participantCount}
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Susunan</label>
          <select
            value={arrangement}
            disabled={!arrangementEligible}
            onChange={(e) => setArrangement(e.target.value)}
            className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {Object.entries(ARRANGEMENT_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {!arrangementEligible && (
            <div className="mt-1 text-[10.5px] italic text-[rgba(var(--ink-rgb),0.5)]">
              Susunan hanya berkaitan untuk Bilik ICC, Bilik TQM &amp; Dewan Produktiviti.
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-[rgba(var(--ink-rgb),0.7)]">Add-on Peralatan</div>
      {availableAddons.length > 0 ? (
        <div className="flex flex-col gap-2.5 border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--surface)] p-3">
          {availableAddons.map((a) => {
            const st = addons[a.key] ?? { checked: false, qty: 1, rateType: "FULL" as const };
            return (
              <div key={a.key}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input type="checkbox" checked={st.checked} onChange={() => toggleAddon(a.key)} className="h-[17px] w-[17px] flex-none" />
                  <div className="min-w-[80px] flex-1 text-[13px] font-semibold">{a.label}</div>
                  <button
                    type="button"
                    onClick={() => setAddons((p) => ({ ...p, [a.key]: { ...st, checked: true, rateType: "HALF" } }))}
                    className="flex-none border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-2 py-1 text-[10.5px] font-bold"
                  >
                    Separuh ({fmtRM(a.half)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddons((p) => ({ ...p, [a.key]: { ...st, checked: true, rateType: "FULL" } }))}
                    className="flex-none border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-2 py-1 text-[10.5px] font-bold"
                  >
                    1 Hari ({fmtRM(a.full)})
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={st.qty}
                    onChange={(e) => setAddons((p) => ({ ...p, [a.key]: { ...st, qty: Number(e.target.value) } }))}
                    className="w-[50px] flex-none border border-[rgba(var(--ink-rgb),0.4)] px-2 py-1.5"
                  />
                </div>
                {st.checked && (
                  <div className="ml-[27px] mt-1 text-[11px] text-[rgba(var(--ink-rgb),0.6)]">
                    {fmtRM(st.rateType === "HALF" ? a.half : a.full)} × {st.qty} = {fmtRM((st.rateType === "HALF" ? a.half : a.full) * st.qty)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-[11.5px] italic text-[rgba(var(--ink-rgb),0.5)]">
          Add-on tersedia untuk Dewan Produktiviti, Bilik ICC atau Bilik TQM sahaja.
        </div>
      )}

      {supportsEarlyAccess && (
        <div className="flex flex-col gap-2.5 border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--warning-bg)] p-3">
          <div className="flex items-center gap-2.5">
            <input type="checkbox" checked={earlyAccess} onChange={(e) => setEarlyAccess(e.target.checked)} className="h-[17px] w-[17px]" />
            <div className="flex flex-1 items-center gap-1.5 text-[13px] font-semibold">
              <Clock weight="duotone" /> Minta Masuk Awal (persediaan)
            </div>
          </div>
          {earlyAccess && (
            <input
              type="number"
              min={15}
              step={15}
              value={earlyAccessMinutes}
              onChange={(e) => setEarlyAccessMinutes(Number(e.target.value))}
              placeholder="Minit lebih awal"
              className="w-40 border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
          )}
        </div>
      )}

      <div>
        <label className={labelClass}>Nota Tambahan (pilihan)</label>
        <textarea
          value={notaTambahan}
          onChange={(e) => setNotaTambahan(e.target.value)}
          rows={2}
          placeholder="Sebarang keperluan atau catatan khas"
          className={`${fieldClass} resize-vertical`}
        />
      </div>

      <div className="mt-1 text-xs font-bold text-[rgba(var(--ink-rgb),0.7)]">Maklumat Sebutharga</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nama</label>
          <input value={sebutNama} onChange={(e) => setSebutNama(e.target.value)} placeholder="Nama penuh" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>No. Telefon</label>
          <input value={sebutTel} onChange={(e) => setSebutTel(e.target.value)} placeholder="cth: 012-3456789" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Organisasi</label>
          <input value={organisasi} onChange={(e) => setOrganisasi(e.target.value)} placeholder="Nama organisasi" className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Emel</label>
          <input value={sebutEmel} onChange={(e) => setSebutEmel(e.target.value)} placeholder="nama@organisasi.com" className={fieldClass} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Alamat Organisasi</label>
          <textarea
            value={alamatOrganisasi}
            onChange={(e) => setAlamatOrganisasi(e.target.value)}
            rows={2}
            placeholder="Alamat penuh organisasi"
            className={`${fieldClass} resize-vertical`}
          />
        </div>
      </div>

      {(facilityPrice > 0 || addonsBreakdown.length > 0) && (
        <div className="flex justify-between border-t border-[rgba(var(--ink-rgb),0.3)] pt-2.5 font-archivo text-sm font-extrabold">
          <span>Anggaran Jumlah Harga</span>
          <span>{fmtRM(totalPrice)}</span>
        </div>
      )}

      {error && <div className="bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">{error}</div>}
      {success && (
        <div className="bg-[var(--success-bg)] px-3 py-2 text-sm text-[var(--success)]">
          Tempahan berjaya dihantar dan menunggu pengesahan admin.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 bg-[var(--accent)] py-3 font-archivo text-sm font-extrabold text-[#f3f2f2] hover:bg-[var(--accent-dark)] disabled:opacity-60"
      >
        {loading ? "Menghantar..." : "Hantar Permohonan Tempahan"}
      </button>
      <div className="text-center text-xs text-[rgba(var(--ink-rgb),0.6)]">
        Sebutharga dan pengesahan tempahan akan dihantar dalam tempoh 3 hari
      </div>
    </form>
  );
}

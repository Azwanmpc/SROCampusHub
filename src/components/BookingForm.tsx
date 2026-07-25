"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ARRANGEMENT_LABEL } from "@/lib/constants";

type Facility = { id: string; name: string; type: string; status: string };

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
  const [addOnProjector, setAddOnProjector] = useState(0);
  const [addOnTv100, setAddOnTv100] = useState(0);
  const [earlyAccess, setEarlyAccess] = useState(false);
  const [earlyAccessMinutes, setEarlyAccessMinutes] = useState(30);
  const [roomNumber, setRoomNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedFacility = facilities.find((f) => f.id === facilityId);
  const isAsrama = selectedFacility?.type === "Asrama";
  const supportsEarlyAccess =
    selectedFacility?.name?.includes("Dewan") ||
    selectedFacility?.name?.includes("ICC") ||
    selectedFacility?.name?.includes("TQM");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!startDate || !endDate) {
      setError("Sila pilih tarikh mula dan tamat");
      return;
    }

    setLoading(true);
    try {
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
          addOnProjector,
          addOnTv100,
          earlyAccess,
          earlyAccessMinutes: earlyAccess ? earlyAccessMinutes : 0,
          roomNumber: isAsrama ? roomNumber : undefined,
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Fasiliti</label>
        <select
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {facilities.map((f) => (
            <option key={f.id} value={f.id} disabled={f.status === "PENYELENGGARAAN"}>
              {f.name} {f.status === "PENYELENGGARAAN" ? "(Dalam Penyelenggaraan)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Tarikh Mula</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Masa Mula</label>
          <input
            type="time"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Tarikh Tamat</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Masa Tamat</label>
          <input
            type="time"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Tujuan Tempahan</label>
        <input
          required
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Cth: Mesyuarat Jawatankuasa"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Bilangan Peserta</label>
          <input
            type="number"
            min={1}
            required
            value={participantCount}
            onChange={(e) => setParticipantCount(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Susunan Bilik/Dewan</label>
          <select
            value={arrangement}
            onChange={(e) => setArrangement(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {Object.entries(ARRANGEMENT_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isAsrama && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Nombor Bilik (Asrama)</label>
          <input
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Cth: A-01 hingga A-05"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div className="rounded-md border border-slate-200 p-3">
        <div className="mb-2 text-xs font-semibold text-slate-600">Add-on Peralatan</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">LCD Projektor (unit)</label>
            <input
              type="number"
              min={0}
              value={addOnProjector}
              onChange={(e) => setAddOnProjector(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">TV LCD 100" (unit)</label>
            <input
              type="number"
              min={0}
              value={addOnTv100}
              onChange={(e) => setAddOnTv100(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {supportsEarlyAccess && (
        <div className="rounded-md border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={earlyAccess}
              onChange={(e) => setEarlyAccess(e.target.checked)}
            />
            Minta Masuk Awal (Early Access) untuk persediaan
          </label>
          {earlyAccess && (
            <div className="mt-2">
              <label className="mb-1 block text-xs text-slate-500">Berapa minit lebih awal?</label>
              <input
                type="number"
                min={15}
                step={15}
                value={earlyAccessMinutes}
                onChange={(e) => setEarlyAccessMinutes(Number(e.target.value))}
                className="w-40 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Tempahan berjaya dihantar dan menunggu pengesahan admin.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
      >
        {loading ? "Menghantar..." : "Hantar Tempahan"}
      </button>
    </form>
  );
}

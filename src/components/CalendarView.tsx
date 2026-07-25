"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import BookingForm from "@/components/BookingForm";
import StatusBadge from "@/components/StatusBadge";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from "@/lib/constants";

type Facility = { id: string; name: string; type: string; status: string };
type Booking = {
  id: string;
  facilityId: string;
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  status: string;
  facility: { name: string };
  user: { name: string };
};

const WEEKDAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarView({ facilities }: { facilities: Facility[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [facilityFilter, setFacilityFilter] = useState<string>("ALL");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const url = facilityFilter === "ALL" ? "/api/bookings" : `/api/bookings?facilityId=${facilityFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [facilityFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.status === "DITOLAK" || b.status === "DIBATALKAN") continue;
      const start = new Date(b.startDateTime);
      const end = new Date(b.endDateTime);
      const cur = new Date(start);
      cur.setHours(0, 0, 0, 0);
      const endDay = new Date(end);
      endDay.setHours(0, 0, 0, 0);
      while (cur <= endDay) {
        const key = toDateKey(cur);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [bookings]);

  const gridDays = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [cursor]);

  function changeMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              &larr;
            </button>
            <div className="w-40 text-center text-sm font-bold text-slate-800">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              &rarr;
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            >
              <option value="ALL">Semua Fasiliti</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSelectedDate(undefined);
                setShowForm(true);
              }}
              className="rounded-md bg-indigo-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-800"
            >
              + Tempahan Baharu
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold text-slate-500">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-2">
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {gridDays.map((day, i) => {
              if (!day) return <div key={i} className="min-h-24 border-b border-r border-slate-100 bg-slate-50/40" />;
              const key = toDateKey(day);
              const dayBookings = bookingsByDay.get(key) ?? [];
              const isToday = day.getTime() === today.getTime();
              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedDate(key);
                    setShowForm(true);
                  }}
                  className={`min-h-24 border-b border-r border-slate-100 p-1.5 text-left align-top hover:bg-indigo-50/50 ${
                    isToday ? "bg-indigo-50/70" : ""
                  }`}
                >
                  <div className={`mb-1 text-xs ${isToday ? "font-bold text-indigo-700" : "text-slate-500"}`}>
                    {day.getDate()}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        title={`${b.facility.name} - ${b.purpose}`}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                          b.status === "DISAHKAN"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {b.facility.name}
                      </div>
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="text-[10px] text-slate-400">+{dayBookings.length - 3} lagi</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-blue-100 border border-blue-300" /> Menunggu Pengesahan
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-100 border border-green-300" /> Disahkan
          </div>
        </div>
      </div>

      <div>
        {showForm ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Borang Tempahan</h2>
              <button onClick={() => setShowForm(false)} className="text-xs text-slate-400 hover:text-slate-600">
                Tutup
              </button>
            </div>
            <BookingForm
              facilities={facilities}
              defaultDate={selectedDate}
              onDone={() => {
                loadBookings();
              }}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-bold text-slate-800">Tempahan Terkini</h2>
            {loading && <p className="text-sm text-slate-400">Memuatkan...</p>}
            <div className="flex flex-col gap-3">
              {bookings.slice(0, 8).map((b) => (
                <div key={b.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">{b.facility.name}</span>
                    <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
                  </div>
                  <div className="text-xs text-slate-500">{b.purpose}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(b.startDateTime).toLocaleString("ms-MY")} — {b.user.name}
                  </div>
                </div>
              ))}
              {!loading && bookings.length === 0 && (
                <p className="text-sm text-slate-400">Tiada tempahan lagi.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

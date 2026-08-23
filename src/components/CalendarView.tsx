"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { CaretLeft, CaretRight, PlusCircle, X } from "@phosphor-icons/react";
import BookingForm from "@/components/BookingForm";
import StatusBadge from "@/components/StatusBadge";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR } from "@/lib/constants";

type Facility = { id: string; name: string; type: string; status: string; halfDayRate: number | null; fullDayRate: number | null; costPerUse: number };
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

const WEEKDAYS = ["Ahd", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun",
  "Julai", "Ogos", "September", "Oktober", "November", "Disember",
];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function CalendarView({ facilities, defaultFacilityId }: { facilities: Facility[]; defaultFacilityId?: string }) {
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
              className="flex h-9 w-9 items-center justify-center border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)]"
            >
              <CaretLeft weight="duotone" />
            </button>
            <div className="w-40 text-center font-archivo text-[15px] font-extrabold">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="flex h-9 w-9 items-center justify-center border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)]"
            >
              <CaretRight weight="duotone" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-3 py-1.5 text-sm"
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
              className="flex items-center gap-1.5 bg-[#6d28d9] px-4 py-2 font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
            >
              <PlusCircle weight="duotone" /> Tempah Fasiliti
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-3 sm:p-6">
          <div className="min-w-[560px]">
            <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold text-[rgba(var(--ink-rgb),0.6)]">
              {WEEKDAYS.map((w) => (
                <div key={w}>{w}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 bg-[rgba(var(--ink-rgb),0.25)]">
              {gridDays.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[80px] bg-[var(--surface)] sm:min-h-[104px]" />;
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
                    className={`min-h-[80px] p-1.5 text-left align-top sm:min-h-[104px] sm:p-2 ${dayBookings.length ? "bg-[var(--white)]" : "bg-[var(--surface)]"} ${
                      isToday ? "outline outline-2 -outline-offset-2 outline-[#6d28d9]" : ""
                    }`}
                  >
                    <div className="mb-1 text-xs font-bold">{day.getDate()}</div>
                    <div className="flex flex-col gap-0.5">
                      {dayBookings.slice(0, 3).map((b) => (
                        <div
                          key={b.id}
                          title={`${b.facility.name} - ${b.purpose}`}
                          className={`truncate px-1.5 py-0.5 text-[11.5px] font-bold text-black ${
                            b.status === "DISAHKAN" ? "bg-[#4bff5e]" : "bg-[#fff300]"
                          }`}
                        >
                          {b.facility.name}
                        </div>
                      ))}
                      {dayBookings.length > 3 && (
                        <div className="text-[10px] text-[rgba(var(--ink-rgb),0.5)]">+{dayBookings.length - 3} lagi</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 border border-[rgba(var(--ink-rgb),0.3)] bg-[#fff300]" /> Tempahan belum disahkan
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 border border-[rgba(var(--ink-rgb),0.3)] bg-[#4bff5e]" /> Tempahan telah disahkan
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-6">
          <h2 className="mb-3 font-archivo text-sm font-extrabold">Tempahan Terkini</h2>
          {loading && <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan...</p>}
          <div className="flex flex-col gap-1 divide-y divide-[rgba(var(--ink-rgb),0.15)]">
            {bookings.slice(0, 8).map((b) => (
              <div key={b.id} className="py-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold">{b.facility.name}</span>
                  <StatusBadge label={BOOKING_STATUS_LABEL[b.status]} colorClass={BOOKING_STATUS_COLOR[b.status]} />
                </div>
                <div className="text-xs text-[rgba(var(--ink-rgb),0.6)]">{b.purpose}</div>
                <div className="text-xs text-[rgba(var(--ink-rgb),0.5)]">
                  {new Date(b.startDateTime).toLocaleString("ms-MY")} — {b.user.name}
                </div>
              </div>
            ))}
            {!loading && bookings.length === 0 && (
              <p className="py-2 text-sm text-[rgba(var(--ink-rgb),0.5)]">Tiada tempahan lagi.</p>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)] p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-archivo text-sm font-extrabold">Borang Tempahan Fasiliti</h2>
              <button onClick={() => setShowForm(false)} className="text-[var(--ink)]" aria-label="Tutup">
                <X weight="bold" size={18} />
              </button>
            </div>
            <BookingForm
              facilities={facilities}
              defaultFacilityId={defaultFacilityId}
              defaultDate={selectedDate}
              onDone={() => {
                loadBookings();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

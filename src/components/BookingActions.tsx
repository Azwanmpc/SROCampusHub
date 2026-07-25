"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Batalkan tempahan ini?")) return;
    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "..." : "Batalkan"}
    </button>
  );
}

export function ApproveRejectButtons({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function handleApprove() {
    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", rejectionReason: reason }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setShowReject(false);
    }
  }

  if (showReject) {
    return (
      <div className="flex items-center gap-2">
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Sebab penolakan"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        />
        <button
          onClick={handleReject}
          disabled={loading}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Sahkan Tolak
        </button>
        <button onClick={() => setShowReject(false)} className="text-xs text-slate-400 hover:text-slate-600">
          Batal
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
      >
        Sahkan
      </button>
      <button
        onClick={() => setShowReject(true)}
        disabled={loading}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Tolak
      </button>
    </div>
  );
}

export function CheckInOutButtons({
  bookingId,
  checkInAt,
  checkOutAt,
}: {
  bookingId: string;
  checkInAt: string | null;
  checkOutAt: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "CHECK_IN" | "CHECK_OUT") {
    setLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!checkInAt) {
    return (
      <button
        onClick={() => handleAction("CHECK_IN")}
        disabled={loading}
        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        Check-In
      </button>
    );
  }
  if (!checkOutAt) {
    return (
      <button
        onClick={() => handleAction("CHECK_OUT")}
        disabled={loading}
        className="rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        Check-Out
      </button>
    );
  }
  return <span className="text-xs text-slate-400">Selesai Check-Out</span>;
}

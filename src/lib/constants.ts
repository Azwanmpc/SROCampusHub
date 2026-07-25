export const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin (Pelulus)",
  PEMOHON: "Pemohon",
  PENGADU: "Pengadu",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu Pengesahan",
  DISAHKAN: "Disahkan",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
};

export const BOOKING_STATUS_COLOR: Record<string, string> = {
  MENUNGGU: "bg-blue-100 text-blue-700 border border-blue-300",
  DISAHKAN: "bg-green-100 text-green-700 border border-green-300",
  DITOLAK: "bg-red-100 text-red-700 border border-red-300",
  DIBATALKAN: "bg-gray-100 text-gray-600 border border-gray-300",
};

export const FACILITY_STATUS_LABEL: Record<string, string> = {
  TERSEDIA: "Tersedia",
  DITEMPAH: "Ditempah",
  PENYELENGGARAAN: "Dalam Penyelenggaraan",
};

export const FACILITY_STATUS_COLOR: Record<string, string> = {
  TERSEDIA: "bg-green-100 text-green-700 border border-green-300",
  DITEMPAH: "bg-blue-100 text-blue-700 border border-blue-300",
  PENYELENGGARAAN: "bg-yellow-100 text-yellow-800 border border-yellow-300",
};

export const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  BARU: "Baru",
  DALAM_TINDAKAN: "Dalam Tindakan",
  SELESAI: "Selesai",
};

export const COMPLAINT_STATUS_COLOR: Record<string, string> = {
  BARU: "bg-red-100 text-red-700 border border-red-300",
  DALAM_TINDAKAN: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  SELESAI: "bg-green-100 text-green-700 border border-green-300",
};

export const REPAIR_TYPE_LABEL: Record<string, string> = {
  DALAMAN: "Dalaman",
  KONTRAKTOR: "Kontraktor Luar",
};

export const ARRANGEMENT_LABEL: Record<string, string> = {
  ROUND_TABLE: "Round Table",
  CLASSROOM: "Classroom Style",
  SEMINAR: "Seminar",
  THEATER: "Theater",
  U_SHAPE: "U-Shape",
  TIADA: "Tiada Susunan Khas",
};

export const FACILITY_TYPES = [
  "Dewan",
  "Asrama",
  "Bilik Mesyuarat",
  "Auditorium",
  "Dewan Makan",
] as const;

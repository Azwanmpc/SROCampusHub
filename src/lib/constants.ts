export const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin (Pelulus)",
  PEMOHON: "Pemohon",
  PENGADU: "Pengadu",
  TEKNIKAL: "Staf Penyelenggaraan",
  PEMINJAM: "Peminjam Aset",
};

export const PINJAMAN_STATUS_LABEL: Record<string, string> = {
  MENUNGGU_KELULUSAN: "Menunggu Kelulusan",
  DITOLAK: "Ditolak",
  DILULUSKAN: "Dipinjam",
  DIPULANGKAN: "Menunggu Pengesahan Pulangan",
  SELESAI: "Selesai",
};

export const PINJAMAN_STATUS_COLOR: Record<string, string> = {
  MENUNGGU_KELULUSAN: "bg-[#4a72a8] text-white",
  DITOLAK: "bg-[#fff2ef] text-[#7c1405]",
  DILULUSKAN: "bg-[#fff300] text-[#4a3800]",
  DIPULANGKAN: "bg-[#fdeee0] text-[#a34e00]",
  SELESAI: "bg-[#4bff5e] text-[#003d0f]",
};

export const BOOKING_STATUS_LABEL: Record<string, string> = {
  MENUNGGU: "Menunggu",
  DISAHKAN: "Disahkan",
  DITOLAK: "Ditolak",
  DIBATALKAN: "Dibatalkan",
};

export const BOOKING_STATUS_COLOR: Record<string, string> = {
  MENUNGGU: "bg-[#4a72a8] text-white",
  DISAHKAN: "bg-[#4bff5e] text-[#003d0f]",
  DITOLAK: "bg-[#fff2ef] text-[#7c1405]",
  DIBATALKAN: "bg-[#eae7e7] text-[#605d5d]",
};

export const FACILITY_STATUS_LABEL: Record<string, string> = {
  TERSEDIA: "Tersedia",
  DITEMPAH: "Ditempah",
  PENYELENGGARAAN: "Penyelenggaraan",
};

export const FACILITY_STATUS_COLOR: Record<string, string> = {
  TERSEDIA: "bg-[#e6f0e9] text-[#4a8a63]",
  DITEMPAH: "bg-[#e8edf3] text-[#4a72a8]",
  PENYELENGGARAAN: "bg-[#fff2ef] text-[#7c1405]",
};

export const COMPLAINT_STATUS_LABEL: Record<string, string> = {
  BARU: "Baru",
  DALAM_TINDAKAN: "Dalam Tindakan",
  MENUNGGU_PENGESAHAN: "Menunggu Pengesahan",
  SELESAI: "Selesai",
};

export const COMPLAINT_STATUS_COLOR: Record<string, string> = {
  BARU: "bg-[#e8edf3] text-[#4a72a8]",
  DALAM_TINDAKAN: "bg-[#fff300] text-[#4a3800]",
  MENUNGGU_PENGESAHAN: "bg-[#fdeee0] text-[#a34e00]",
  SELESAI: "bg-[#4bff5e] text-[#003d0f]",
};

export const PRIORITY_LABEL: Record<string, string> = {
  TINGGI: "Keutamaan Tinggi",
  SEDERHANA: "Keutamaan Sederhana",
  RENDAH: "Keutamaan Rendah",
};

export const PRIORITY_COLOR: Record<string, string> = {
  TINGGI: "bg-[#fff2ef] text-[#7c1405]",
  SEDERHANA: "bg-[#f5eedd] text-[#8a6d1f]",
  RENDAH: "bg-[#eae7e7] text-[#605d5d]",
};

export const COMPLAINT_CATEGORY_LABEL: Record<string, string> = {
  ELEKTRIK: "Elektrik",
  PLUMBING: "Plumbing",
  HVAC: "HVAC",
  STRUKTUR: "Struktur",
  LANDSKAP: "Landskap",
  LAIN: "Lain-lain",
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

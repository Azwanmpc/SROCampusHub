export const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin (Pelulus)",
  PEMOHON: "Pemohon",
  PENGADU: "Pengadu",
  TEKNIKAL: "Staf Penyelenggaraan",
  PEMINJAM: "Peminjam Aset",
  STAFF_MPC: "Staff MPC",
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
  DITOLAK: "bg-[var(--danger-bg)] text-[var(--danger)]",
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
  DITOLAK: "bg-[var(--danger-bg)] text-[var(--danger)]",
  DIBATALKAN: "bg-[#eae7e7] text-[#605d5d]",
};

export const FACILITY_STATUS_LABEL: Record<string, string> = {
  TERSEDIA: "Tersedia",
  DITEMPAH: "Ditempah",
  PENYELENGGARAAN: "Penyelenggaraan",
};

export const FACILITY_STATUS_COLOR: Record<string, string> = {
  TERSEDIA: "bg-[var(--success-bg)] text-[var(--success)]",
  DITEMPAH: "bg-[#e8edf3] text-[#4a72a8]",
  PENYELENGGARAAN: "bg-[var(--danger-bg)] text-[var(--danger)]",
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
  TINGGI: "bg-[var(--danger-bg)] text-[var(--danger)]",
  SEDERHANA: "bg-[var(--warning-bg)] text-[var(--warning)]",
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

export const KOS_LOKASI_LABEL: Record<string, string> = {
  BANGUNAN_PENTADBIRAN_1: "Bangunan Pentadbiran 1",
  BANGUNAN_PENTADBIRAN_2: "Bangunan Pentadbiran 2",
  BILIK_LATIHAN_ICC: "Bilik Latihan ICC",
  BILIK_LATIHAN_TQM: "Bilik Latihan TQM",
  SURAU: "Surau",
  ASRAMA: "Asrama",
  AUDITORIUM: "Auditorium",
  DEWAN_PRODUKTIVITI: "Dewan Produktiviti",
  LAIN_LAIN: "Lain-lain",
};

export const KOS_JENIS_LABEL: Record<string, string> = {
  PEMBAIKAN: "Pembaikan",
  PENYELENGGARAAN: "Penyelenggaraan",
};

export const KOS_KATEGORI_LABEL: Record<string, string> = {
  ELEKTRIK: "Elektrik",
  AIR_PLUMBING: "Air / Plumbing",
  PENGHAWA_DINGIN: "Penghawa Dingin",
  BANGUNAN_STRUKTUR: "Bangunan / Struktur",
  PERABOT: "Perabot",
  ICT_RANGKAIAN: "ICT / Rangkaian",
  AUDIO_VISUAL: "Audio Visual",
  PERALATAN: "Peralatan",
  LAIN_LAIN: "Lain-lain",
};

export const FACILITY_TYPES = [
  "Dewan",
  "Asrama",
  "Bilik Mesyuarat",
  "Auditorium",
  "Dewan Makan",
] as const;

import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("Email tidak sah"),
  username: z.string().min(3, "Username sekurang-kurangnya 3 aksara"),
  phone: z.string().min(9, "Nombor telefon tidak sah"),
  password: z.string().min(6, "Kata laluan sekurang-kurangnya 6 aksara"),
  role: z.enum(["PEMOHON"]),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Sila masukkan email/username"),
  password: z.string().min(1, "Sila masukkan kata laluan"),
  rememberMe: z.boolean().optional(),
});

export const bookingSchema = z.object({
  facilityId: z.string().min(1),
  startDateTime: z.string().min(1),
  endDateTime: z.string().min(1),
  purpose: z.string().min(3, "Sila nyatakan tujuan tempahan"),
  participantCount: z.coerce.number().min(1),
  arrangement: z.enum(["ROUND_TABLE", "CLASSROOM", "SEMINAR", "THEATER", "U_SHAPE", "TIADA"]),
  rateType: z.enum(["HALF", "FULL"]).default("FULL"),
  addOnProjector: z.coerce.number().min(0).default(0),
  addOnTv100: z.coerce.number().min(0).default(0),
  earlyAccess: z.coerce.boolean().default(false),
  earlyAccessMinutes: z.coerce.number().min(0).default(0),
  roomNumber: z.string().optional(),
  organisasi: z.string().optional(),
  alamatOrganisasi: z.string().optional(),
  sebutNama: z.string().optional(),
  sebutTel: z.string().optional(),
  sebutEmel: z.string().optional(),
  addonsJson: z.string().optional(),
  asramaRoomsJson: z.string().optional(),
});

export const pinjamanAsetSchema = z.object({
  jawatan: z.string().min(1, "Sila nyatakan jawatan"),
  bahagian: z.string().min(1, "Sila nyatakan bahagian"),
  tujuan: z.string().min(3, "Sila nyatakan tujuan pinjaman"),
  tempatDigunakan: z.string().min(1, "Sila nyatakan tempat digunakan"),
  tarikhDijangkaPulang: z.string().min(1, "Sila nyatakan tarikh dijangka pulang"),
  asetIds: z.array(z.string().min(1)).min(1, "Sila pilih sekurang-kurangnya satu aset"),
});

export const complaintSchema = z.object({
  facilityId: z.string().optional(),
  location: z.string().optional(),
  description: z.string().min(5, "Sila nyatakan butiran kerosakan"),
  priority: z.enum(["TINGGI", "SEDERHANA", "RENDAH"]).default("SEDERHANA"),
  guestName: z.string().optional(),
  guestPhone: z.string().optional(),
});

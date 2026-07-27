// Fixed rate cards that aren't per-facility DB rows: asrama room types and
// equipment add-ons, scoped to specific facility names as in the design brief.

export const ASRAMA_ROOM_TYPES = [
  { key: "EKSEKUTIF", label: "Suit Eksekutif", rate: 150, bilikTersedia: 1 },
  { key: "BIASA", label: "Bilik Biasa", rate: 70, bilikTersedia: 38 },
  { key: "DORM", label: "Bilik Dorm", rate: 150, bilikTersedia: 1 },
] as const;

export type AddonDef = {
  key: string;
  label: string;
  appliesTo: string[];
  half: number;
  full: number;
};

export const ADDON_DEFS: AddonDef[] = [
  { key: "tv-lcd", label: "TV LCD 100\"", appliesTo: ["Bilik ICC", "Bilik TQM"], half: 100, full: 200 },
  { key: "led-skrin", label: "LED Skrin", appliesTo: ["Dewan Produktiviti"], half: 400, full: 700 },
  { key: "lcd-projektor", label: "LCD Projektor", appliesTo: ["Dewan Produktiviti", "Bilik ICC", "Bilik TQM"], half: 200, full: 300 },
];

export function addonsForFacility(facilityName: string) {
  return ADDON_DEFS.filter((a) => a.appliesTo.includes(facilityName));
}

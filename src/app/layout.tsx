import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SRO CampusHub",
  description: "Sistem Pengurusan Penempahan Fasiliti & Penyelenggaraan Kampus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#201e1d]">{children}</body>
    </html>
  );
}

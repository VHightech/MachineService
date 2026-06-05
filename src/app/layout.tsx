import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Officina — Gestionale Manutenzioni",
  description:
    "Gestione manutenzioni, magazzino pezzi di ricambio e macchine.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${bricolage.variable} ${hanken.variable}`}>
      <body className="antialiased">
        <div className="flex min-h-screen w-full">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 py-5 md:px-7 md:py-7">
            <MobileNav />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

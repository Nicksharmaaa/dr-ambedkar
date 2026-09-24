import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ambedkar Heritage Intelligence & Digital Preservation System",
  description:
    "Institutional digital preservation archive, semantic intelligence engine, and scholarly corpus of Dr. B.R. Ambedkar's writings and speeches.",
  keywords: [
    "Ambedkar",
    "B.R. Ambedkar",
    "BAWS",
    "Annihilation of Caste",
    "Indian Constitution",
    "Digital Preservation",
    "Turso",
    "AI Archive",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

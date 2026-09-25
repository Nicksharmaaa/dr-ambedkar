import type { Metadata } from "next";
import "./globals.css";
import { UserModeProvider } from "@/lib/UserModeContext";
import { MuseumProvider } from "@/components/museum/MuseumContext";
import { MuseumShell } from "@/components/museum/MuseumShell";

export const metadata: Metadata = {
  title: "Ambedkar Digital Heritage Archive & Museum",
  description:
    "An interactive digital heritage archive and knowledge lab dedicated to Dr. B. R. Ambedkar, featuring the Constitutional Quest game, speech soundboard, Wisdom Machine, 22 volumes of verified writings, multi-script OCR, and a source-grounded AI research assistant.",
  keywords: [
    "Ambedkar",
    "B.R. Ambedkar",
    "BAWS",
    "Annihilation of Caste",
    "Indian Constitution",
    "Digital Museum",
    "Digital Preservation",
    "AI Archive",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Cinzel:wght@600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300..1000;1,9..40,300..1000&family=Montserrat:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF7F0] text-[#0A2947] antialiased selection:bg-[#D3D4C0] selection:text-[#0A2947]">
        <UserModeProvider>
          <MuseumProvider>
            <MuseumShell>{children}</MuseumShell>
          </MuseumProvider>
        </UserModeProvider>
      </body>
    </html>
  );
}

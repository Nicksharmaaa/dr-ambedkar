import type { Metadata } from "next";
import "./globals.css";
import { UserModeProvider } from "@/lib/UserModeContext";
import { MuseumProvider } from "@/components/museum/MuseumContext";
import { MuseumShell } from "@/components/museum/MuseumShell";
import ClickSpark from "@/components/ui/ClickSpark";
import Grainient from "@/components/ui/Grainient";

export const metadata: Metadata = {
  title: "Ambedkar Digital Heritage Archive & Museum",
  description:
    "An interactive digital heritage archive and knowledge lab dedicated to Dr. B. R. Ambedkar, featuring the Constitutional Quest game, speech soundboard, Wisdom Machine, 22 volumes of verified writings, multi-script OCR, and a source-grounded AI research assistant.",
  icons: {
    icon: "/favicon.ico",
  },
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
    <html lang="en" suppressHydrationWarning className="bg-transparent">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=DM+Sans:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-transparent text-[#0A2947] antialiased selection:bg-[#D3D4C0] selection:text-[#0A2947]">
        {/* Full-Website Living Grainient Background */}
        <div
          id="global-grainient-bg"
          aria-hidden="true"
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
        >
          <Grainient
            color1="#F7EFE2"
            color2="#cec7be"
            color3="#d8cfb2"
            timeSpeed={2.95}
            colorBalance={0.0}
            warpStrength={1.0}
            warpFrequency={5.0}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            blendAngle={0.0}
            blendSoftness={0.05}
            rotationAmount={500.0}
            noiseScale={2.0}
            grainAmount={0.1}
            grainScale={2.0}
            grainAnimated={false}
            contrast={1.5}
            gamma={1.0}
            saturation={1.0}
            centerX={0.0}
            centerY={0.0}
            zoom={0.9}
            className="w-full h-full"
          />
        </div>
        <ClickSpark
          global={true}
          sparkColor="#C59A45"
          sparkSize={12}
          sparkRadius={20}
          sparkCount={8}
          duration={400}
        />
        <div className="relative z-10 min-h-screen flex flex-col bg-transparent">
          <UserModeProvider>
            <MuseumProvider>
              <MuseumShell>{children}</MuseumShell>
            </MuseumProvider>
          </UserModeProvider>
        </div>
      </body>
    </html>
  );
}

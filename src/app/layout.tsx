/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import { Anybody, Caveat, DM_Sans, Space_Mono, VT323, Bungee_Shade } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const anybody = Anybody({ variable: "--font-anybody", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400", "700"] });
const vt323 = VT323({ variable: "--font-vt323", subsets: ["latin"], weight: "400" });
const bungeeShade = Bungee_Shade({ variable: "--font-bungee-shade", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "REWOUND - Press Play",
  description: "A VHS Nostalgia Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anybody.variable} ${caveat.variable} ${dmSans.variable} ${spaceMono.variable} ${vt323.variable} ${bungeeShade.variable} dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-vhs-black text-tape-cream selection:bg-primary selection:text-vhs-black min-h-screen flex flex-col">
        {/* Global VHS FX Shell */}
        <div className="vhs-overlay scanlines"></div>
        <div className="vhs-overlay grain"></div>
        <div className="vhs-overlay vignette"></div>
        
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

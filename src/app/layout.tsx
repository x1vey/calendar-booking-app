import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "callme | Your schedule, perfectly structured.",
  description: "Sophisticated calendar booking and automated email pipelines for organized professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/*
         * Theme fonts — loaded globally so they are available to all three
         * aesthetic calendar components without per-component <link> tags.
         *
         * Fitness  (Form Studio)   : Bebas Neue, Space Grotesk
         * Tattoo   (Ink & Ether)   : Playfair Display, DM Mono
         * Garment  (Vélin Atelier) : Cormorant Garamond, Jost
         */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}

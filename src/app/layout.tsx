import type { Metadata } from "next";
import { Lekton, DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const lekton = Lekton({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lekton",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Display face. Licence: Befonts, commercial use allowed.
const bantayog = localFont({
  src: [
    { path: "./fonts/bantayog-light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/bantayog-regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-bantayog",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NUBB | The Things We Carry - Official Coming Soon",
  description:
    "NUBB makes small objects that become part of how you move through life. Handmade objects that blur the line between art and utility. Subscribe for early access.",
  keywords: ["NUBB", "The Things We Carry", "Handmade", "Art and Utility", "Everyday Carry", "EDC", "Design"],
  openGraph: {
    title: "NUBB - The Things We Carry",
    description: "Handmade objects that blur the line between art and utility.",
    url: "https://nubb.store",
    siteName: "NUBB",
    images: [
      {
        url: "/brand/brand-mark.png",
        width: 800,
        height: 800,
        alt: "NUBB Brand Mark",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${lekton.variable} ${dmSans.variable} ${bantayog.variable}`}
    >
      <body className="antialiased selection:bg-nubb-orange selection:text-nubb-cream">
        {children}
      </body>
    </html>
  );
}

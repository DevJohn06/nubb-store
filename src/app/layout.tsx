import type { Metadata } from "next";
import { Lekton, Rubik_Spray_Paint, Inter } from "next/font/google";
import "./globals.css";

const lekton = Lekton({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-lekton",
  display: "swap",
});

const rubikSpray = Rubik_Spray_Paint({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-spray",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={`${lekton.variable} ${rubikSpray.variable} ${inter.variable}`}>
      <body className="antialiased selection:bg-[#892F1A] selection:text-[#E8E6D8]">
        {children}
      </body>
    </html>
  );
}

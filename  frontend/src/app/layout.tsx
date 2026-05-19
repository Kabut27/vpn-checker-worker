import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VPN Checker - Angalia Matumizi",
  description: "Angalia matumizi ya data na muda wa VPN yako",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sw" className="dark">
      <body className={`${inter.className} antialiased bg-neutral-950 text-white`}>
        <HeroUIProvider>{children}</HeroUIProvider>
      </body>
    </html>
  );
}

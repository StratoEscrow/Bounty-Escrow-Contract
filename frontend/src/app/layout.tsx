import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StratoEscrow - Decentralized Bounty Platform",
  description: "Bounty escrow platform on Stellar/Soroban",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

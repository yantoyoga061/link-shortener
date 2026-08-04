import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Splice — Pemendek Tautan",
  description: "Ubah tautan panjang jadi pendek, dalam sekali klik.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans text-ink antialiased">{children}</body>
    </html>
  );
}

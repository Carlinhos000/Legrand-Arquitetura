import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Legrand Arquitetura | Arquitetura e interiores em Joinville",
  description: "Projetos que transformam espaços em experiências. Arquitetura, interiores e planejamento de ambientes residenciais e comerciais em Joinville e região.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}

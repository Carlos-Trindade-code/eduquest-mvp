import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduQuest — Tutor IA que ensina de verdade",
  description:
    "Tutor socratico com IA para ajudar criancas de 4 a 18 anos a aprender de verdade, sem dar respostas prontas.",
  keywords: ["educacao", "tutor IA", "aprendizado", "socratico", "criancas"],
  openGraph: {
    title: "EduQuest — Tutor IA que ensina de verdade",
    description:
      "Plataforma de tutoria com IA que guia criancas a pensar, nao apenas a copiar respostas.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

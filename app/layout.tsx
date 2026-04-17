import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNavWrapper } from "@/components/layout/BottomNavWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.studdo.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Studdo — Tutor IA que ensina de verdade",
    template: "%s | Studdo",
  },
  description:
    "Tutor socrático com IA para ajudar crianças de 4 a 18 anos a aprender de verdade, sem dar respostas prontas.",
  keywords: [
    "educação",
    "tutor IA",
    "aprendizado",
    "socrático",
    "crianças",
    "estudo",
    "reforço escolar",
    "inteligência artificial",
    "Studdo",
  ],
  authors: [{ name: "Studdo", url: SITE_URL }],
  creator: "Studdo",
  publisher: "Studdo",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Studdo — Tutor IA que ensina de verdade",
    description:
      "Plataforma de tutoria com IA que guia crianças a pensar, não apenas a copiar respostas.",
    url: SITE_URL,
    siteName: "Studdo",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Studdo — Tutor IA que ensina de verdade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og"],
    title: "Studdo — Tutor IA que ensina de verdade",
    description:
      "Plataforma de tutoria com IA que guia crianças a pensar, não apenas a copiar respostas.",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Studdo",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="theme-color" content="#0D1B2A" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){r.forEach(function(reg){reg.unregister()})});caches.keys().then(function(k){k.forEach(function(c){caches.delete(c)})})}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <BottomNavWrapper />
      </body>
    </html>
  );
}

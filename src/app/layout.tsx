import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CuanPintar - Customer Acquisition OS for Indonesia",
  description: "Create one program and distribute it across verified media, creators, affiliates, sales teams, communities, and mission networks.",
  keywords: ["customer acquisition", "partner marketing", "affiliate", "media network", "Indonesia", "CPA", "CPL"],
  authors: [{ name: "Recto Vero Media" }],
  openGraph: {
    title: "CuanPintar - Customer Acquisition OS",
    description: "Create one program and distribute it across verified media partners in Indonesia",
    url: "https://cuanpintar.com",
    siteName: "CuanPintar",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CuanPintar - Customer Acquisition OS",
    description: "Create one program and distribute it across verified media partners",
  },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%236366F1' rx='20' width='100' height='100'/><text x='50%' y='50%' dominant-baseline='central' text-anchor='middle' font-size='60' font-weight='bold' fill='white'>C</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
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

const title = "The Solar System — An Interactive 3D Journey";
const description =
  "Explore an interactive 3D model of the solar system. Click any planet to fly to it and learn the facts.";

export const metadata: Metadata = {
  title,
  description,
  applicationName: "3D Solar System",
  keywords: [
    "solar system",
    "3D",
    "planets",
    "WebGL",
    "Three.js",
    "interactive",
    "space",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "3D Solar System",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#05060d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

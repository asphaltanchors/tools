import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AAC Technical Tools Suite",
  description: "Professional engineering calculation platform for construction and materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <div className="min-h-screen">
          <Suspense fallback={<div className="ml-64 p-8 text-gray-400 font-mono">Loading...</div>}>
            <Navigation />
          </Suspense>
          <main className="ml-64 bg-white min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

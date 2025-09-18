import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/ui/Navbar";
import PageLayout from "../components/layout/PageLayout";
import { AuthProvider } from "../lib/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "סיכומון - פלטפורמה לסיכום מסמכים",
  description:
    "פלטפורמה מתקדמת לסיכום מסמכים ושיתוף ידע. העלה מסמכים, צור סיכומים איכותיים ושתף אותם עם הקהילה",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          <PageLayout>{children}</PageLayout>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

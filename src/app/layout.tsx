import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Canvas Hub - Studio Management Platform",
  description: "Enterprise-grade SAAS platform for creative business management, client management, and operational efficiency.",
  keywords: ["Studio Management", "CRM", "Project Management", "Invoicing", "Creative Business", "SAAS"],
  authors: [{ name: "Canvas Hub Team" }],
  openGraph: {
    title: "Canvas Hub - Studio Management Platform",
    description: "Enterprise-grade SAAS platform for creative business management",
    url: "https://canvashub.app",
    siteName: "Canvas Hub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Canvas Hub - Studio Management Platform",
    description: "Enterprise-grade SAAS platform for creative business management",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

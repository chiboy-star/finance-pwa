import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "@/src/components/layout/Navigation";
import { Toaster } from "sonner"; // <-- Changed this line to import directly from the package
import "./globals.css";




const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Finance Tracker",
  description: "Private offline-first spending tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinanceApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-background text-foreground antialiased min-h-screen`}>
        <Navigation />
        
        <main className="pb-20 md:pb-8 md:ml-64 min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
          {children}
        </main>

        {/* <-- Add the Toaster here, configured to show at the top center */}
        <Toaster position="top-center" richColors /> 
      </body>
    </html>
  );
}
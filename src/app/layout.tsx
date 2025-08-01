import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from "@/components/ui/sonner";
import "simplebar-react/dist/simplebar.min.css"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReadPDF",
  description: "Chat with your pdf in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <Providers>
      <body
        className={cn(
          "min-h-screen font-sans antialiased grainy",
          inter.className
        )}
      >
        <Toaster/>
        <Navbar />
        {children}
      </body>
      </Providers>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Urbanist, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { PWARegister } from "@/components/shared/PWARegister";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mastermoosai Institute",
  description: "Training institute for Art and Software Development",
  manifest: "/manifest.webmanifest",
  applicationName: "Mastermoosai",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mastermoosai",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${urbanist.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
        <PWARegister />
      </body>
    </html>
  );
}

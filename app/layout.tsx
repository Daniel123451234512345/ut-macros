import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import BottomTabs from "@/components/BottomTabs";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Longhorn Macros (unofficial)",
  description: "Track calories and macros from UT Austin dining hall menus. Unofficial student project.",
  applicationName: "Longhorn Macros",
  appleWebApp: { capable: true, title: "LH Macros", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f1" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`}>
      <body className="min-h-dvh font-sans">
        <div className="mx-auto max-w-xl pb-[calc(5rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
          {children}
          <footer className="px-4 pb-4 pt-8 text-center text-xs text-muted">
            Nutrition data from UT Housing &amp; Dining&apos;s public menu. Unofficial.
          </footer>
        </div>
        <BottomTabs />
      </body>
    </html>
  );
}

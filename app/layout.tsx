import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import BottomTabs from "@/components/BottomTabs";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["600", "800"] });

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
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#161c21" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${bricolage.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Runs before paint on full loads; marked text/plain in the browser so React doesn't warn (Next's no-flash pattern). */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body className="min-h-dvh font-sans">
        <div className="mx-auto max-w-xl pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)]">
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

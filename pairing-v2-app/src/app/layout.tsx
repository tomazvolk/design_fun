import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Newsreader, Nunito } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { APP_NAME, BASE_PATH } from "@/lib/config";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin", "latin-ext"] });
const news = Newsreader({ variable: "--font-news", subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "What goes with what: a map of flavour pairings you can walk, built outward from what is already in the pan.",
  manifest: `${BASE_PATH}/manifest.webmanifest`,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  icons: { icon: `${BASE_PATH}/icon.svg`, apple: `${BASE_PATH}/apple-touch-icon.png` },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f2f3f7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${nunito.variable} ${news.variable} h-full`}>
      <body className="min-h-full">
        <StoreProvider>
          <Suspense fallback={null}>
            <Shell>{children}</Shell>
          </Suspense>
        </StoreProvider>
      </body>
    </html>
  );
}

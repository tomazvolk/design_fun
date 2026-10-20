import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { APP_NAME, BASE_PATH } from "@/lib/config";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin", "latin-ext"], axes: ["SOFT", "opsz"], weight: "variable" });

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
  themeColor: "#f2f1ee",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} h-full`}>
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

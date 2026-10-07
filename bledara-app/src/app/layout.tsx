import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { StoreProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Bledara", template: "%s · Bledara" },
  description: "Every software subscription, bought, paid, managed and cancelled from one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--font-sans": "var(--font-geist-sans)" } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <StoreProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

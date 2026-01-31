import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainerWrapper } from "@/components/ToastContainerWrapper";

export const metadata: Metadata = {
  title: "X Arena - Gamified Dashboard",
  description: "Contribution Showcase and Growth Incentive Platform",
  icons: {
    icon: [
      {
        url: "/favicon.jpg",
        type: "image/jpeg",
      },
      {
        url: "/favicon.jpg",
        sizes: "32x32",
        type: "image/jpeg",
      },
      {
        url: "/favicon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        url: "/favicon.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
    shortcut: "/favicon.jpg",
    apple: [
      {
        url: "/favicon.jpg",
        sizes: "180x180",
        type: "image/jpeg",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('x-arena-theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <ToastProvider>
                {children}
                <ToastContainerWrapper />
              </ToastProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


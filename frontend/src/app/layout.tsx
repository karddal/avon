import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, PT_Serif } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import ImpersonationBanner from "@/components/impersonation-banner";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import "../app/globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-ibm-mono",
});

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-serif",
});

export const metadata: Metadata = {
  title: "Avon",
  description: "Continuous Assessment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${ptSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Suspense
              fallback={
                <ImpersonationBanner initialIsImpersonating={false}>
                  {children}
                </ImpersonationBanner>
              }
            >
              <ImpersonationSessionShell>{children}</ImpersonationSessionShell>
            </Suspense>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

async function ImpersonationSessionShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api
    .getSession({
      headers: await headers(),
    })
    .catch(() => null);
  const isImpersonating = Boolean(session?.session.impersonatedBy);
  const impersonatedUserName = isImpersonating ? session?.user.name : undefined;

  return (
    <ImpersonationBanner
      initialIsImpersonating={isImpersonating}
      initialImpersonatedUserName={impersonatedUserName}
    >
      {children}
    </ImpersonationBanner>
  );
}

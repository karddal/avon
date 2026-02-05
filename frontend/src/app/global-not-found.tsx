"use client";

import { Undo } from "lucide-react";
import { IBM_Plex_Mono, IBM_Plex_Sans, PT_Serif } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import "./globals.css";

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

export default function GlobalNotFound() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${ptSerif.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {mounted ? (
            <div className="relative min-h-svh w-full flex items-center justify-center p-6 md:p-10">
              <Image
                src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/campus.jpg`}
                alt="Campus"
                fill
                className="object-cover -z-10 brightness-50"
                priority
              />

              <div className="w-full max-w-sm flex flex-col items-center justify-center bg-card border shadow-lg p-10 rounded-lg gap-6 text-center">
                <p className="font-serif text-9xl">404</p>

                <div className="space-y-2">
                  <p className="text-xl font-semibold tracking-tight">
                    <strong>Oops!</strong> Page not found.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We couldn't find the page you are looking for. It might have
                    been moved or deleted.
                  </p>
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  type="button"
                  onClick={() => router.back()}
                >
                  <Undo className="mr-2 h-4 w-4" /> Go back
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-svh w-full bg-background" />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}

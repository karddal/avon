"use client";
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { SearchAlert } from "lucide-react";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "404",
  description: "Sorry! The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  const router = useRouter();
  return (
    <html>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative min-h-svh w-full flex items-center justify-center p-6 md:p-10">
            <Image
              src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/campus.jpg`}
              alt="Campus"
              fill
              className="object-cover -z-10 brightness-100"
              priority
            />
            <div className="w-full max-w-sm items-center justify-center bg-card border shadow p-4">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <SearchAlert />
                  </EmptyMedia>
                  <div className="flex flex-row justify- gap-2">
                    <EmptyTitle className="text-2xl">
                      404 - Page not found
                    </EmptyTitle>
                  </div>

                  <EmptyDescription>{metadata.description}</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <button
                    className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                    type={"button"}
                    onClick={() => router.back()}
                  >
                    Go back
                  </button>
                </EmptyContent>
              </Empty>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

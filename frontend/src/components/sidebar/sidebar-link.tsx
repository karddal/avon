"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarLinkProps {
  url: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarLink({ url, children, className }: SidebarLinkProps) {
  const pathname = usePathname();

  const isActive =
    url === "/" ? pathname === "/" : pathname.startsWith(url) && url !== "#";

  return (
    <Link
      href={url}
      className={cn(
        "flex flex-row items-center h-full w-full transition-colors gap-2 py-2!",
        isActive
          ? "border-l-4 border-l-black dark:border-l-white bg-accent/50"
          : "border-l-4 border-transparent hover:bg-accent/30",
        className,
      )}
    >
      {children}
    </Link>
  );
}

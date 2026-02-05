"use client";
import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function SidebarCloser() {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [setOpenMobile]);

  return null;
}

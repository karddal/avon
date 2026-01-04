"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DropdownCardProps {
  title: string;
  desc: string;
  openByDefault: boolean;
  children: React.ReactNode;
  className?: string;
}

export function DropdownCard({
  title,
  desc,
    openByDefault,
  children,
  className,
}: DropdownCardProps) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <Card className={`flex flex-col gap-0 ${className}`}>
      <CardHeader
        className="flex flex-row items-center gap-4 cursor-pointer select-none "
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="hover:bg-accent-foreground/5">
          <div className="text-2xl">{title}</div>
          <div className="font-light">{desc}</div>
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent className="flex flex-col mt-4 gap-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

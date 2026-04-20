"use client";
import type * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DropdownCardProps extends React.ComponentProps<typeof Card> {
  title: string;
  desc: string;
  openByDefault: boolean;
  children: React.ReactNode;
}

export function DropdownCard({
  title,
  desc,
  openByDefault,
  children,
  className,
  ...props
}: DropdownCardProps) {
  const [open, setOpen] = useState(openByDefault);
  return (
    <Card className={cn("flex flex-col gap-0", className)} {...props}>
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

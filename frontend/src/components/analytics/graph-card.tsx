"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function GraphCard({
  title = "Student Graph",
  subtitle = "Visualisation of scores across all students.",
  children,
  className = "",
}: GraphCardProps) {
  return (
    <Card className={`flex-1 ${className}`}>
      <CardHeader>
        <CardTitle>
          <div className="text-2xl">{title}</div>
          {subtitle && <div className="font-light">{subtitle}</div>}
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}

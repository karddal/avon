"use client";

import { CourseworkCreateForm } from "@/components/coursework/create/coursework-create-form";
import type { FormProps } from "@/components/coursework/create/types";

export const IntForm = ({ units }: FormProps) => {
  return <CourseworkCreateForm units={units} />;
};

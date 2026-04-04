"use client";

import type {FormProps} from "@/components/coursework/create/types";
import {CourseworkCreateForm} from "@/components/coursework/create/coursework-create-form";

export const IntForm = ({ units }: FormProps) => {
    return <CourseworkCreateForm units={units} />
}

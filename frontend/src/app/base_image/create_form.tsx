"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { create_base_image } from "@/lib/actions/base_image/create_base_image";

const formSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().min(1).max(500),
  task_definition: z.string().nonempty(),
});

export function CreateBIForm() {
  const [submitState, setSubmitState] = useState<boolean>(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      task_definition: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    setSubmitState(true);

    const req = {
      name: data.name,
      description: data.description,
      task_definition: data.task_definition,
    };
    create_base_image(req).then((s) => {
      if (!s.success) {
        toast.error("Failed to create the base image.");
        setSubmitState(false);
      } else {
        toast.success("Base image created.");
        setSubmitState(false);
        router.refresh();
      }
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={"w-full flex flex-col gap-2"}
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="text"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="form-rhf-textarea-about">
              Description
            </FieldLabel>
            <Textarea
              {...field}
              id="form-rhf-textarea-about"
              aria-invalid={fieldState.invalid}
              placeholder="My awesome base image..."
              className="min-h-[120px]"
            />
            <FieldDescription>
              Write some information about the base image
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="task_definition"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>AWS task definition name:revision</FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="string"
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Button type="button" variant="outline" onClick={() => form.reset()}>
        Reset
      </Button>

      {submitState && (
        <Button type={"submit"} variant={"ghost"} disabled>
          <Spinner />
          Submit
        </Button>
      )}

      {!submitState && (
        <Button type={"submit"} variant={"default"}>
          Submit
        </Button>
      )}
    </form>
  );
}

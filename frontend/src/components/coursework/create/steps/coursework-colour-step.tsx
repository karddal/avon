"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Controller, type UseFormReturn } from "react-hook-form";
import { PRESET_COLOURS } from "@/components/coursework/create/utils/coursework-form-constants";
import type { CourseworkFormValues } from "@/components/coursework/create/utils/coursework-form-schema";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

type Props = {
  form: UseFormReturn<CourseworkFormValues>;
  onBack: () => void;
  onNext: () => void;
};

export function CourseworkColourStep({ form, onBack, onNext }: Props) {
  return (
    <FieldGroup>
      <Controller
        name="color"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Choose a colour for your coursework.</FieldLabel>

            <div role="listbox" className="flex flex-wrap gap-2">
              {PRESET_COLOURS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="option"
                  aria-label={`Choose colour ${color}`}
                  onClick={() => field.onChange(color)}
                  className="size-8 cursor-pointer border-2 border-input"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <p>or pick from the picker below:</p>

            <div className="flex w-[30%] flex-col gap-2">
              <HexColorPicker
                className="w-full border-2 border-input"
                color={field.value}
                onChange={field.onChange}
              />
              <HexColorInput
                prefixed
                className="border border-input bg-accent p-2"
                color={field.value}
                onChange={field.onChange}
              />
            </div>

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <ButtonGroup orientation="vertical" className="w-full gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button
          type="button"
          data-cy="create-coursework-next-step-2"
          onClick={() => {
            form.trigger(["color"]).then((valid) => {
              if (valid) onNext();
            });
          }}
        >
          <ArrowRight />
          Next
        </Button>
      </ButtonGroup>
    </FieldGroup>
  );
}

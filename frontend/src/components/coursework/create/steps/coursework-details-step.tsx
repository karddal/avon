"use client"

import dynamic from "next/dynamic";
import {Controller, UseFormReturn} from "react-hook-form";
import {CourseworkFormValues} from "@/components/coursework/create/utils/coursework-form-schema";
import type {UnitOption, UnitData} from "@/components/coursework/create/types";
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {
    toDataCyValue,
    validateDueDateAgainstUnitEnd
} from "@/components/coursework/create/utils/courseowrk-form-helpers";
import {Spinner} from "@/components/ui/spinner";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ArrowRight, OctagonAlert} from "lucide-react";
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

const Calendar29 = dynamic(
    () => import("@/components/calendar").then((mod) => mod.Calendar29),
    { ssr: false },
);

type Props = {
    form: UseFormReturn<CourseworkFormValues>
    units: UnitOption[]
    selectedUnitData: UnitData | null
    selectedUnitLoading: boolean
    selectedUnitError: string | null
    onNext: () => void
}

export function CourseworkDetailsStep({
    form,
    units,
    selectedUnitData,
    selectedUnitLoading,
    selectedUnitError,
    onNext,
                                      }: Props) {
    return (
        <FieldGroup>
            <Controller
                name="unit_id"
                control={form.control}
                render={({field, fieldState}) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-flow-unit">Choose a unit</FieldLabel>
                        <select
                            {...field}
                            id="form-flow-unit"
                            data-cy="create-coursework-unit"
                            aria-invalid={fieldState.invalid}
                            className="border-input bg-background w-full border p-2"
                        >
                            <option value="">Select a unit</option>
                            {units.map((unit) => (
                                <option
                                    key={unit.id}
                                    value={unit.id}
                                    data-cy={`create-coursework-unit-option-${toDataCyValue(`${unit.unit_code} ${unit.name}`)}`}
                                >
                                    {unit.unit_code} — {unit.name}
                                </option>
                            ))}
                        </select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            {selectedUnitLoading && (
                <div className="flex items-center gap-2 text-sm">
                    <Spinner />
                    Loading unit dates...
                </div>
            )}

            {selectedUnitError && (
                <Alert variant="destructive">
                    <OctagonAlert />
                    <AlertTitle>Couldn't load unit details</AlertTitle>
                    <AlertDescription>{selectedUnitError}</AlertDescription>
                </Alert>
            )}

            {selectedUnitData && (
                <Item data-cy="create-coursework-selected-unit" variant="muted">
                    <ItemContent>
                        <ItemTitle>Selected unit</ItemTitle>
                        <ItemDescription>
                            <span className="font-mono">{selectedUnitData.unit_code}</span>{" "}
                            {selectedUnitData.name}
                        </ItemDescription>
                        <ItemTitle>Unit ends</ItemTitle>
                        <ItemDescription>
                            {new Date(selectedUnitData.end_date).toLocaleString()}
                        </ItemDescription>
                    </ItemContent>
                </Item>
            )}

            <Controller
                name="name"
                control={form.control}
                render={({field, fieldState}) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-flow-name">Name your coursework</FieldLabel>
                        <Input
                            {...field}
                            id="form-flow-name"
                            data-cy="create-coursework-name"
                            aria-invalid={fieldState.invalid}
                            placeholder="My amazing coursework"
                            autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Controller
                name="description"
                control={form.control}
                render={({field, fieldState}) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="form-flow-description">coursework description</FieldLabel>
                        <Textarea
                            {...field}
                            id="form-flow-description"
                            data-cy="create-coursework-description"
                            aria-invalid={fieldState.invalid}
                            placeholder="A great description"
                            autoComplete="off"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Controller
                name="due_date"
                control={form.control}
                render={({field, fieldState}) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="date">Choose the due date for the coursework</FieldLabel>
                        <Calendar29
                            props={{
                                date: field.value,
                                setDate: (date:Date) => {
                                    field.onChange(date)

                                    const errorMessage = validateDueDateAgainstUnitEnd(date, selectedUnitData?.end_date)

                                    if (errorMessage) {
                                        form.setError("due_date", {
                                            type: "manual",
                                            message: errorMessage,
                                        })
                                    } else {
                                        form.clearErrors("due_date")
                                    }
                                }
                            }}
                        />
                        {selectedUnitData && (
                            <p className="text-muted-foreground text-sm">
                                Latest allowed date:{" "}
                                {new Date(selectedUnitData.end_date).toLocaleString()}
                            </p>
                        )}
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Button
                type="button"
                data-cy="create-coursework-next-step-1"
                onClick={onNext}
            >
                <ArrowRight />
                Next
            </Button>
        </FieldGroup>
    )
}
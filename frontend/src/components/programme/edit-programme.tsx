"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const Calendar29 = dynamic(
  () => import("@/components/programmeCal").then((mod) => mod.Calendar29),
  { ssr: false },
);

import { OctagonAlert, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import { update_programme } from "@/lib/actions/update_programme";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface FormProps {
  programme_update_data: ProgrammeUpdateData;
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
}

type ProgrammeUpdateData = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export default function EditProgramme({
  programme_update_data,
  open_state,
  set_open_state,
}: FormProps) {
  const b = useIsMobile();

  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
    const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false)

  const today = new Date();
  const router = useRouter();
  const formSchema = z
    .object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 character." })
        .max(100, { message: "Name must be at most 100 characters." }),
      start_date: z.date(),
      end_date: z
        .date()
        .min(today, { message: `End date must be in the future.` }),
    })
    .refine((data) => data.end_date > data.start_date, {
      path: ["end_date"],
      message: "End date must be after start date.",
    });

    const editDefaultValues = useMemo(
        () => ({
            name: programme_update_data.name ?? "",
            start_date: new Date(programme_update_data.start_date),
            end_date: new Date(programme_update_data.end_date),
        }),
        [programme_update_data.id],
    )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: editDefaultValues,
  });

    useEffect(() => {
        if (open_state) {
            form.reset(editDefaultValues)
            setShowAlert(false)
            setAlertText("")
        }
    }, [open_state, programme_update_data.id, editDefaultValues, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // do something with values, submit here
    setSubmitState(true);
    const req = {
      id: programme_update_data.id,
      name: values.name,
      start_date: values.start_date.toISOString().split("T")[0],
      end_date: values.end_date.toISOString().split("T")[0],
    };
    await update_programme(req).then((r) => {
      if (!r.success) {
        // console.log(r.data.detail);
        setAlertText(
          "An unknown error occurred. Your changes haven't been saved.",
        );
        setShowAlert(true);
        setSubmitState(false);
      } else {
        toast.success("Coursework updated successfully.");
        setSubmitState(false);
        router.refresh();
          form.reset(values)
          set_open_state(false)
      }
    });
  }

    function requestClose() {
        if (submitState) return;

        if (form.formState.isDirty) {
            setConfirmDiscardOpen(true);
            return;
        }

        form.reset(editDefaultValues);
        set_open_state(false);
    }

    function discardClose() {
        form.reset(editDefaultValues);
        setConfirmDiscardOpen(false);
        set_open_state(false);
    }

  return (
    <>
        <Sheet
            open={open_state}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    set_open_state(true);
                } else {
                    requestClose();
                }
            }}
        >
            <SheetContent
                className={"h-full flex flex-col p-0"}
                side={b ? "top" : "right"}
                onInteractOutside={(event) => {
                    if (form.formState.isDirty) {
                        event.preventDefault();
                        setConfirmDiscardOpen(true);
                    }
                }}
                onEscapeKeyDown={(event) => {
                    if (form.formState.isDirty) {
                        event.preventDefault();
                        setConfirmDiscardOpen(true);
                    }
                }}
            >
                <div className="px-6 pt-6">
                    <SheetHeader>
                        <SheetTitle>Edit this programme</SheetTitle>
                        <SheetDescription>
                            You can modify this programme here. Please remember to save when you are done.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className={"flex-1 overflow-y-auto px-6 pb-28"}>
                    <form
                        id="edit-programme-form"
                        className={"h-full form-flow flex flex-col justify-between"}
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FieldGroup className={""}>
                            <Controller
                                name={"name"}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="form-flow-name"
                                            className="text-base font-semibold"
                                        >
                                            Programme name
                                        </FieldLabel>

                                        <Input
                                            {...field}
                                            id={"form-flow-name"}
                                            aria-invalid={fieldState.invalid}
                                            placeholder={"My amazing coursework"}
                                            autoComplete={"off"}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />
                            <Controller
                                name={"start_date"}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="date"
                                            className="text-base font-semibold"
                                        >
                                            Programme start date
                                        </FieldLabel>
                                        <Calendar29
                                            props={{
                                                date: field.value,
                                                setDate: field.onChange,
                                                version: "start",
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            ></Controller>
                            <Controller
                                name={"end_date"}
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel
                                            htmlFor="date"
                                            className="text-base font-semibold"
                                        >
                                            Programme end date
                                        </FieldLabel>
                                        <Calendar29
                                            props={{
                                                date: field.value,
                                                setDate: field.onChange,
                                                version: "end",
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            ></Controller>
                        </FieldGroup>

                        {showAlert && (
                            <Alert variant="destructive">
                                <OctagonAlert />
                                <AlertTitle>Heads up!</AlertTitle>
                                <AlertDescription>{alertText}</AlertDescription>
                            </Alert>
                        )}
                    </form>
                </div>

                <div>
                    <SheetFooter>
                        <ButtonGroup
                            orientation={"vertical"}
                            className={"gap-2 w-full"}
                        >
                            {submitState && (
                                <Button disabled={true} className="w-full">
                                    <Spinner />
                                    Save changes
                                </Button>
                            )}
                            {!submitState && (
                                <Button
                                    type={"submit"}
                                    form="edit-programme-form"
                                    className="w-full"
                                >
                                    <Save />
                                    Save changes
                                </Button>
                            )}
                        </ButtonGroup>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={requestClose}
                            disabled={submitState}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>

        <AlertDialog
            open={confirmDiscardOpen}
            onOpenChange={setConfirmDiscardOpen}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Discard changes?</AlertDialogTitle>

                    <AlertDialogDescription>
                        Unsaved changes. If you close now, your edits won&apos;t be saved.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={discardClose}>
                        Discard & exit
                    </AlertDialogAction>

                    <AlertDialogCancel>Keep editing</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

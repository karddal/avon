"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type Dispatch, type SetStateAction, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: programme_update_data.name,
      start_date: new Date(programme_update_data.start_date),
      end_date: new Date(programme_update_data.end_date),
    },
  });

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
      }
    });
  }

  const name = form.watch("name");
  const start_date = form.watch("start_date");
  const end_date = form.watch("end_date");
  return (
    <Sheet open={open_state} onOpenChange={set_open_state}>
      <SheetContent
        className={"h-full overflow-y-scroll"}
        side={b ? "top" : "right"}
      >
        <SheetHeader>
          <SheetTitle>Edit this programme</SheetTitle>
          <SheetDescription>
            You can modify this programme here. Please remember to save when
            you are done.
          </SheetDescription>
        </SheetHeader>

        <div className={"h-full overflow-y-scroll px-4"}>
          <form
            className={"h-full form-flow flex flex-col justify-between"}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className={""}>
              <Controller
                name={"name"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"form-flow-name"}>
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
                    <FieldLabel htmlFor={"date"}>
                      Program start date
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
                    <FieldLabel htmlFor={"date"}>
                      Program end date
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
            <div>
              <SheetFooter>
                <ButtonGroup
                  orientation={"vertical"}
                  className={"gap-2 w-full"}
                >
                  {submitState && (
                    <Button disabled={true}>
                      <Spinner />
                      Save changes
                    </Button>
                  )}
                  {!submitState && (
                    <Button type={"submit"}>
                      <Save />
                      Save changes
                    </Button>
                  )}
                </ButtonGroup>

                {showAlert && (
                  <Alert variant="destructive">
                    <OctagonAlert />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>{alertText}</AlertDescription>
                  </Alert>
                )}

                <SheetClose asChild>
                  <Button variant={"outline"}>Cancel</Button>
                </SheetClose>
              </SheetFooter>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

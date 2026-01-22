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
  () => import("@/components/calendar").then((mod) => mod.Calendar29),
  { ssr: false },
);

import { OctagonAlert, Save } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import { update_coursework } from "@/lib/actions/update_coursework";

interface FormProps {
  coursework_update_data: CourseworkUpdateData;
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
}

type CourseworkUpdateData = {
  id: string;
  name: string;
  description?: string;
  unit_id: string;
  due_date: string;
  creation_date: string;
  colour: string;
  unit_name: string;
  unit_code: string;
  max_end_date: Date;
};

export default function EditCoursework({
  coursework_update_data,
  open_state,
  set_open_state,
}: FormProps) {
  const b = useIsMobile();

  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const today = new Date();
  const router = useRouter();
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    description: z.string().min(2, {
      message: "Description must be at least 2 characters.",
    }),
    color: z.string(),
    due_date: z
      .date()
      .min(today, {
        message: `Due date must be in the future.`,
      })
      .max(
        coursework_update_data.max_end_date,
        `Due date cannot be after the unit ends (${coursework_update_data.max_end_date.toISOString()})`,
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: coursework_update_data.name,
      description: coursework_update_data.description,
      due_date: new Date(coursework_update_data.due_date),
      color: `#${coursework_update_data.colour}`,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // do something with values, submit here
    setSubmitState(true);
    const req = {
      id: coursework_update_data.id,
      name: values.name,
      description: values.description,
      unit_id: coursework_update_data.unit_id,
      due_date: values.due_date.toISOString(),
      colour: colour.substring(1),
    };
    await update_coursework(req).then((r) => {
      if (!r.success) {
        console.log(r.data.detail);
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
  const _name = form.watch("name");
  const _description = form.watch("description");
  const colour = form.watch("color");
  const _due_date = form.watch("due_date");

  return (
    <Sheet open={open_state} onOpenChange={set_open_state}>
      <SheetContent
        className={"h-full overflow-y-scroll"}
        side={b ? "top" : "right"}
      >
        <SheetHeader>
          <SheetTitle>Edit this coursework</SheetTitle>
          <SheetDescription>
            You can modify this coursework here. Please remember to save when
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
                      Coursework name
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
                name={"description"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"form-flow-description"}>
                      Coursework description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={"form-flow-description"}
                      aria-invalid={fieldState.invalid}
                      placeholder={"A great description"}
                      autoComplete={"off"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name={"due_date"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"date"}>
                      Coursework due date
                    </FieldLabel>
                    <Calendar29
                      props={{
                        date: field.value,
                        setDate: field.onChange,
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              ></Controller>
              <Controller
                name={"color"}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={"form-flow-description"}>
                      Coursework colour
                    </FieldLabel>
                    <div
                      role={"listbox"}
                      className={
                        "flex flex-row flex-wrap gap-2 w-full justify-items-center align-items-center"
                      }
                    >
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#ff6467");
                        }}
                        onClick={() => {
                          field.onChange("#ff6467");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-red-300 cursor-pointer size-8 rounded-none bg-red-400"
                      ></span>
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#e17100");
                        }}
                        onClick={() => {
                          field.onChange("#e17100");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-amber-300 cursor-pointer size-8 rounded-none bg-amber-400"
                      ></span>
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#05df72");
                        }}
                        onClick={() => {
                          field.onChange("#05df72");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-green-300 cursor-pointer size-8 rounded-none bg-green-400"
                      ></span>
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#51a2ff");
                        }}
                        onClick={() => {
                          field.onChange("#51a2ff");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-blue-300 cursor-pointer size-8 rounded-none bg-blue-400"
                      ></span>
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#c27aff");
                        }}
                        onClick={() => {
                          field.onChange("#c27aff");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-purple-300 cursor-pointer size-8 rounded-none bg-purple-400"
                      ></span>
                      <span
                        tabIndex={0}
                        role={"option"}
                        onKeyDown={(e) => {
                          e.key === "Enter" && field.onChange("#fb64b6");
                        }}
                        onClick={() => {
                          field.onChange("#fb64b6");
                        }}
                        className=" aspect-square border-2 border-input hover:bg-pink-300 cursor-pointer size-8 rounded-none bg-pink-400"
                      ></span>
                    </div>
                    or pick from the picker below:
                    <div
                      className={
                        "flex flex-col justify-items-center align-center gap-2"
                      }
                    >
                      <HexColorPicker
                        className={"w-full! border-none border-input"}
                        color={field.value}
                        onChange={(color) => {
                          field.onChange(color);
                        }}
                      />
                      <HexColorInput
                        prefixed={true}
                        className={"border bg-accent p-2 border-input"}
                        color={field.value}
                        onChange={(color) => {
                          field.onChange(color);
                        }}
                      />
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]}></FieldError>
                    )}
                  </Field>
                )}
              />
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

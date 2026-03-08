"use client";
// adapted from github.com/Marcosfitzsimons/multi-step-form
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, OctagonAlert, Send } from "lucide-react";
import { easeIn, easeOut } from "motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {type Dispatch, type SetStateAction, useEffect, useMemo, useState} from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const Calendar29 = dynamic(
  () => import("@/components/calendar").then((mod) => mod.Calendar29),
  { ssr: false },
);

import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { create_coursework } from "@/lib/actions/create_coursework";
import {getRequestJWT} from "@/lib/auth-utils";

export type UnitOption = {
    id: string;
    name: string;
    unit_code: string;
    programme_start_date: string;
    programme_end_date: string;
}

type UnitData = {
    id: string;
    name: string;
    description?: string;
    creation_date: string;
    unit_code: string;
    colour: string;
    programme_id: string;
    start_date: string;
    end_date: string;
}

interface FormProps {
    units: UnitOption[]
}

function nextStep(step: number, setStep: Dispatch<SetStateAction<number>>) {
  if (step <= 1) {
    setStep(step + 1);
  }
}

function prevStep(step: number, setStep: Dispatch<SetStateAction<number>>) {
  if (step > 0) {
    setStep(step - 1);
  }
}

function _resetStep(setStep: Dispatch<SetStateAction<number>>) {
  setStep(0);
}

export const IntForm = ({ units }: FormProps) => {
  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const [step, setStep] = useState<number>(0);
    const [selectedUnitData, setSelectedUnitData] = useState<UnitData | null>(null)
    const [selectedUnitLoading, setSelectedUnitLoading] = useState(false)
    const [selectedUnitError, setSelectedUnitError] = useState<string | null>(null)

    const router = useRouter()
  const today = new Date();

  const formSchema = z.object({
      unit_id: z.uuid({
          message: "Please choose a valid unit.",
      }),
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
      }),
  });

  const formVariants = {
    hidden: {
      opacity: 0,
      x: -50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        ease: easeIn,
      },
    },
    exit: {
      opacity: 0,
      x: 50,
      transition: {
        ease: easeOut,
      },
    },
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        unit_id: "",
      name: "",
      description: "",
      due_date: new Date(new Date(today).setHours(today.getHours() + 25)),
      color: "#abcdef",
    },
      mode: "onTouched",
  });

    const selectedUnitId = form.watch("unit_id")
    const selectedUnitSummary = useMemo(
        () => units.find((unit) => unit.id === selectedUnitId) ?? null,
        [units, selectedUnitId],
    )

    const colour = form.watch("color")
    const name = form.watch("name")
    const description = form.watch("description")
    const due_date = form.watch("due_date")

    useEffect(() => {
        async function loadUnitData(unitId: string) {
            try {
                setSelectedUnitLoading(true)
                setSelectedUnitError(null)
                setSelectedUnitData(null)

                const token = await getRequestJWT()

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/units/${unitId}/with_dates`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                        cache: "no-cache",
                    },
                );

                if (!response.ok) {
                    throw new Error("Failed to load unit dates.")
                }

                const unit: UnitData = await response.json();
                setSelectedUnitData(unit)

                const currentDueDate = form.getValues("due_date")
                const unitEndDate = new Date(unit.end_date)

                if (currentDueDate > unitEndDate) {
                    form.setError("due_date", {
                        type: "manual",
                        message: `Due date cannot be after the unit ends (${unitEndDate.toLocaleString()}).`,
                    });
                } else {
                    form.clearErrors("due_date")
                }

            } catch (error) {
                setSelectedUnitError(
                    error instanceof Error ? error.message : "Failed to load unit data.",
                )
                form.clearErrors("due_date")
            } finally {
                setSelectedUnitLoading(false)
            }
        }

        if (!selectedUnitId) {
            setSelectedUnitData(null)
            setSelectedUnitError(null)
            setSelectedUnitLoading(false)
            return
        }

        void loadUnitData(selectedUnitId)
    }, [selectedUnitId, form])

    async function validateOne() {
        setShowAlert(false)
        setAlertText("")

        const baseValid = await form.trigger([
            "unit_id",
            "name",
            "description",
            "due_date",
        ])

        if (!baseValid) {
            return false
        }

        if (!selectedUnitId) {
            form.setError("unit_id", {
                type: "manual",
                message: "Please choose a unit.",
            });
            return false
        }

        if (selectedUnitLoading) {
            setShowAlert(true)
            setAlertText("Please wait for the selected unit details to finish loading.")
            return false
        }

        if (selectedUnitError || !selectedUnitData) {
            setShowAlert(true)
            setAlertText(selectedUnitError ?? "Could not load unit details.")
            return false
        }

        const chosenDueDate = form.getValues("due_date")
        const unitEndDate = new Date(selectedUnitData.end_date)

        if (chosenDueDate > unitEndDate) {
            form.setError("due_date", {
                type: "manual",
                message: `Due date cannot be after the unit ends (${unitEndDate.toLocaleString()}).`,
            });
            return false
        }

        form.clearErrors("due_date")
        return true
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // do something with values, submit here
        setSubmitState(true);
        setShowAlert(false)
        setAlertText("")

        if (!selectedUnitData) {
            setAlertText("Please choose a unit and wait for its details to load.")
            setShowAlert(true)
            setSubmitState(false)
            return
        }

        const unitEndDate = new Date(selectedUnitData.end_date)

        if (values.due_date > unitEndDate) {
            setAlertText(
                `Due date cannot be after the unit ends (${unitEndDate.toLocaleString()}).`,
            )
            setShowAlert(true)
            setSubmitState(false)
            return
        }

        const req = {
            name: values.name,
            description: values.description,
            unit_id: values.unit_id,
            due_date: values.due_date.toISOString(),
            colour: values.color.substring(1),
        };

        const r = await create_coursework(req)

        if (!r.success) {
            setAlertText(r.data.detail)
            setShowAlert(true)
            setSubmitState(false)
            return
        }

        toast.success("Coursework created.")
        setSubmitState(false);

        setTimeout(() => {
            window.location.href = "/coursework";
        }, 300)
    }

  return (
    <div className="flex w-full justify-center p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <Card className={"w-full border-0 shadow-none text-base"}>
          <Progress value={step * 50} className={"rounded-none"}></Progress>
          <CardHeader>
            <CardTitle>Create a coursework</CardTitle>
            <CardDescription>
              <p>
                Let's create a coursework! There's a couple of steps, but we'll
                guide you through it.
              </p>
                {selectedUnitData ? (
                    <>
                        You are adding a coursework to{" "}
                        <Link
                            className="text-foreground underline"
                            href={`/units/${selectedUnitData.id}`}
                        >
                            <span className="font-mono">{selectedUnitData.unit_code}</span>{" "}
                            {selectedUnitData.name}
                        </Link>
                        .
                    </>
                ) : (
                    "Choose a unit to begin."
                )}
            </CardDescription>
          </CardHeader>

          <CardContent
            className={"flex h-full flex-col content-between justify-between"}
          >
            <form id={"form-flow"} onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode={"wait"}>
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial="visible"
                    animate={"visible"}
                    variants={formVariants}
                    exit={"exit"}
                  >
                    <FieldGroup>
                        <Controller
                            name={"unit_id"}
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="form-flow-unit">
                                        Choose a unit
                                    </FieldLabel>
                                    <select
                                        {...field}
                                        id="form-flow-unit"
                                        aria-invalid={fieldState.invalid}
                                        className="border-input bg-background w-full border p-2"
                                    >
                                        <option value="">Select a unit</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.unit_code} — {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
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
                            <Item variant="muted">
                                <ItemContent>
                                    <ItemTitle>Selected unit</ItemTitle>
                                    <ItemDescription>
                              <span className="font-mono">
                                {selectedUnitData.unit_code}
                              </span>{" "}
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
                        name={"name"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={"form-flow-name"}>
                              Name your coursework
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
                              Give your coursework a description
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
                              Choose the due date for the coursework
                            </FieldLabel>
                            <Calendar29
                              props={{
                                date: field.value,
                                  setDate: (date: Date) => {
                                      field.onChange(date);

                                      if (selectedUnitData) {
                                          const unitEndDate = new Date(
                                              selectedUnitData.end_date,
                                          );

                                          if (date > unitEndDate) {
                                              form.setError("due_date", {
                                                  type: "manual",
                                                  message: `Due date cannot be after the unit ends (${unitEndDate.toLocaleString()}).`,
                                              });
                                          } else {
                                              form.clearErrors("due_date");
                                          }
                                      }
                                  },
                              }}
                            />
                              {selectedUnitData && (
                                  <p className="text-muted-foreground text-sm">
                                      Latest allowed date:{" "}
                                      {new Date(
                                          selectedUnitData.end_date,
                                      ).toLocaleString()}
                                  </p>
                              )}
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      <Button
                        type={"button"}
                        onClick={() => {
                            void validateOne().then((valid) => {
                                if (valid) {
                                    nextStep(step, setStep);
                                }
                            })
                        }}
                      >
                        <ArrowRight />
                        Next
                      </Button>
                    </FieldGroup>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial="hidden"
                    animate={"visible"}
                    variants={formVariants}
                    exit={"exit"}
                  >
                    <FieldGroup>
                      <Controller
                        name={"color"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={"form-flow-description"}>
                              Choose a colour for your coursework.
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
                                  e.key === "Enter" &&
                                    field.onChange("#ff6467");
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
                                  e.key === "Enter" &&
                                    field.onChange("#e17100");
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
                                  e.key === "Enter" &&
                                    field.onChange("#05df72");
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
                                  e.key === "Enter" &&
                                    field.onChange("#51a2ff");
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
                                  e.key === "Enter" &&
                                    field.onChange("#c27aff");
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
                                  e.key === "Enter" &&
                                    field.onChange("#fb64b6");
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
                                "flex flex-col justify-items-center align-center gap-2 w-[30%]!"
                              }
                            >
                              <HexColorPicker
                                className={"w-full! border-2 border-input"}
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
                              <FieldError
                                errors={[fieldState.error]}
                              ></FieldError>
                            )}
                          </Field>
                        )}
                      />
                      <ButtonGroup
                        orientation={"vertical"}
                        className={"gap-2 w-full"}
                      >
                        <Button
                          type={"button"}
                          variant={"outline"}
                          onClick={() => {
                            prevStep(step, setStep);
                          }}
                        >
                          <ArrowLeft />
                          Back
                        </Button>
                        <Button
                          type={"button"}
                          onClick={() => {
                            form.trigger(["color"]).then((_result) => {
                              if (form.formState.isValid) {
                                nextStep(step, setStep);
                              }
                            });
                          }}
                        >
                          <ArrowRight />
                          Next
                        </Button>
                      </ButtonGroup>
                    </FieldGroup>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial="visible"
                    animate={"visible"}
                    variants={formVariants}
                    exit={"exit"}
                  >
                    <CardHeader className={"p-0"}>
                      <CardTitle className={"font-medium text-sm"}>
                        Summary
                      </CardTitle>
                      <CardDescription>
                        Here's a summary of the information you've provided.
                      </CardDescription>
                    </CardHeader>
                    <FieldGroup
                      className={"flex flex-col content-between h-full"}
                    >
                      <div className={"flex flex-col"}>
                        <Item variant={"muted"}>
                          <ItemContent>
                              <ItemTitle>Unit</ItemTitle>
                              <ItemDescription>
                                  {selectedUnitData ? (
                                      <Link
                                          className="text-foreground underline"
                                          href={`/units/${selectedUnitData.id}`}
                                      >
                                  <span className="font-mono">
                                    {selectedUnitData.unit_code}
                                  </span>{" "}
                                          {selectedUnitData.name}
                                      </Link>
                                  ) : selectedUnitSummary ? (
                                      <>
                                  <span className="font-mono">
                                    {selectedUnitSummary.unit_code}
                                  </span>{" "}
                                          {selectedUnitSummary.name}
                                      </>
                                  ) : (
                                      "Not provided."
                                  )}
                              </ItemDescription>

                              <ItemTitle>Coursework name</ItemTitle>
                              <ItemDescription>
                                  {name ? name : "Not provided."}
                              </ItemDescription>

                              <ItemTitle>Coursework description</ItemTitle>
                              <ItemDescription>
                                  {description ? description : "Not provided."}
                              </ItemDescription>

                              <ItemTitle>Due date</ItemTitle>
                              <ItemDescription>
                                  {due_date ? due_date.toString() : "Not provided."}
                              </ItemDescription>

                              <ItemTitle>Colour</ItemTitle>
                              <ItemDescription>{colour}</ItemDescription>
                              <p
                                  style={{ backgroundColor: colour }}
                                  className="size-8 aspect-square rounded-none border-2 border-input"
                              />
                          </ItemContent>
                        </Item>
                      </div>
                      <ButtonGroup
                        orientation={"vertical"}
                        className={"gap-2 w-full"}
                      >
                        {submitState && (
                          <>
                            <Button
                              disabled={true}
                              type={"button"}
                              variant={"outline"}
                              onClick={() => {
                                prevStep(step, setStep);
                              }}
                            >
                              <ArrowLeft />
                              Back
                            </Button>
                            <Button disabled={true}>
                              <Spinner />
                              Submit
                            </Button>
                          </>
                        )}
                        {!submitState && (
                          <>
                            <Button
                              type={"button"}
                              variant={"outline"}
                              onClick={() => {
                                prevStep(step, setStep);
                              }}
                            >
                              <ArrowLeft />
                              Back
                            </Button>
                            <Button type={"submit"}>
                              <Send />
                              Submit
                            </Button>
                          </>
                        )}
                      </ButtonGroup>

                      {showAlert && (
                        <Alert variant="destructive">
                          <OctagonAlert />
                          <AlertTitle>Heads up!</AlertTitle>
                          <AlertDescription>
                            {alertText.toString()}
                          </AlertDescription>
                        </Alert>
                      )}
                    </FieldGroup>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

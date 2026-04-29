"use client";
// adapted from github.com/Marcosfitzsimons/multi-step-form
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, OctagonAlert, Send } from "lucide-react";
import { easeIn, easeOut } from "motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const Calendar29 = dynamic(
  () => import("@/components/calendar").then((mod) => mod.Calendar29),
  { ssr: false },
);

import Link from "next/link";
import { MarkdownEditor } from "@/components/markdown-editor";
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
import { create_coursework } from "@/lib/actions/coursework/create_coursework";

interface FormProps {
  slug: string;
  unitCode: string;
  unitName: string;
  unitId: string;
  maxDueDate: Date;
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

export const IntForm = ({
  slug,
  unitCode,
  unitName,
  unitId,
  maxDueDate,
}: FormProps) => {
  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const today = new Date();
  const _router = useRouter();
  const s = slug;
  const formSchema = z.object({
    name: z
      .string()
      .regex(/^[A-Za-z0-9](?:[A-Za-z0-9]|[ \-(][A-Za-z0-9])*(?:\))?$/, {
        message: "Only alphanumeric characters and hyphens are allowed",
      })
      .min(2, {
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
        maxDueDate,
        `Due date cannot be after the unit ends (${maxDueDate.toISOString()})`,
      ),
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
      name: "",
      description: "",
      due_date: new Date(new Date(today).setHours(today.getHours() + 25)),
      color: "#abcdef",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // do something with values, submit here
    setSubmitState(true);
    const req = {
      name: values.name,
      description: values.description,
      unit_id: s,
      due_date: values.due_date.toISOString(),
      colour: colour.substring(1),
    };
    await create_coursework(req).then((r) => {
      if (!r.success) {
        setAlertText(r.data.detail);
        setShowAlert(true);
        setSubmitState(false);
      } else {
        toast.success(
          "Coursework created. You will be redirected in 1 second.",
        );
        const delay = new Promise((resolve) => setTimeout(resolve, 1000));
        delay.then(() => {
          window.location.href = `/units/${s}`;
        });
        setSubmitState(false);
      }
    });
  }

  const name = form.watch("name");
  const description = form.watch("description");
  const colour = form.watch("color");
  const due_date = form.watch("due_date");
  return (
    <div className="flex flex-1 flex-row gap-4 px-4 sm:justify-center sm:align-center sm:items-center">
      <div className="flex sm:flex-row w-full lg:w-[70%] gap-4 h-fit mb-2">
        <Card className={"flex-1"}>
          <Progress value={step * 50} className={"rounded-none"}></Progress>
          <CardHeader>
            <CardTitle>Create a coursework</CardTitle>
            <CardDescription>
              <p>
                Let's create a coursework! There's a couple of steps, but we'll
                guide you through it.
              </p>
              You are adding a coursework to{" "}
              <Link
                className={"text-foreground underline"}
                href={`/units/${unitId}`}
              >
                <span className="font-mono">{unitCode}</span> {unitName}.
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent
            className={"flex h-full flex-col content-between justify-between"}
          >
            <form id={"form-flow"} onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode={"wait"} initial={false}>
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
                            <MarkdownEditor
                              value={field.value}
                              onChange={field.onChange}
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
                                setDate: field.onChange,
                              }}
                            />
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      ></Controller>
                      <Button
                        type={"button"}
                        onClick={() => {
                          form
                            .trigger(["name", "description", "due_date"])
                            .then((isValid) => {
                              if (isValid) {
                                nextStep(step, setStep);
                              }
                            });
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
                            form.trigger(["color"]).then((isValid) => {
                              if (isValid) {
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
                              className="aspect-square border-2 border-input size-8 rounded-none "
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

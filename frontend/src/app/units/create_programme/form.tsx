"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, OctagonAlert, Send } from "lucide-react";
import { easeIn, easeOut } from "motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const Calendar29 = dynamic(
  () => import("@/components/calendar").then((mod) => mod.Calendar29),
  { ssr: false },
);

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


function nextStep(step: number, setStep: Dispatch<SetStateAction<number>>) {
  if (step <= 0) {
    setStep(step + 1);
  }
}

function prevStep(step: number, setStep: Dispatch<SetStateAction<number>>) {
  if (step > 0) {
    setStep(step - 1);
  }
}


export const ProgForm = () => {
const slug = "dummy-slug";
  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const [step, setStep] = useState<number>(0);
  const today = new Date();
  const _router = useRouter();
  const s = slug;

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    start_date: z
          .date()
          .min(today, {
            message: `Start date must be in the future.`,
    }),
    end_date: z.date()
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
      start_date: new Date(new Date(today).setDate(today.getDate() + 1)),
      end_date: new Date(new Date(today).setFullYear(today.getFullYear() + 1)),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // do something with values, submit here

    setSubmitState(true);
    const req = {
      name: values.name,
      start_date: values.start_date,
      end_date: values.end_date,
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
  const start_date = form.watch("start_date");
  const end_date = form.watch("end_date");
  return (
    <div className="flex flex-1 flex-row gap-4 px-4 sm:justify-center sm:align-center sm:items-center">
      <div className="flex sm:flex-row w-full lg:w-[70%] gap-4 mb-2 h-fit mb-2">
        <Card className={"flex-1"}>
          <Progress value={step * 100} className={"rounded-none"}></Progress>
          <CardHeader>
            <CardTitle>Create a Programme</CardTitle>
            <CardDescription>
              <p>
                Let's create a programme! There's a couple of steps, but we'll
                guide you through it.
              </p>
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
                        name={"start_date"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={"date"}>
                              Choose the start date for the programme
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
                            .trigger(["name", "start_date"])
                            .then((_result) => {
                              if (form.formState.isValid) {
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
                            <ItemTitle>Start date</ItemTitle>
                            <ItemDescription>
                              {start_date ? start_date.toString() : "Not provided."}
                            </ItemDescription>
                            <ItemTitle>End date</ItemTitle>
                            <ItemDescription>
                              {end_date ? end_date.toString() : "Not provided."}
                            </ItemDescription>
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

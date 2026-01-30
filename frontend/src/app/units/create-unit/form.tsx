"use client";

import type { UUID } from "node:crypto";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Send, Terminal } from "lucide-react";
import { easeIn, easeOut } from "motion";
import { useEffect, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { multistep_unit_flow } from "./multistep_unit_flow";

interface FormProps {
  slug: Promise<{ slug: string }>;
}

interface Programme {
  id: UUID;
  name: string;
  start_date: string;
  end_date: string;
}

export const IntForm: React.FC<FormProps> = ({ slug }) => {
  const [submitState, setSubmitState] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertText, setAlertText] = useState<string>("");
  const { step, next, back } = multistep_unit_flow();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [programmeName, setProgrammeName] = useState<string>("");

  useEffect(() => {
    async function loadProgrammes() {
      const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programmes/`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error("Could not fetch programmes");
      }
      setProgrammes(data.programmes);
      console.log();
    }

    loadProgrammes();
  }, []);

  async function loadSlug(): Promise<string> {
    const s = await slug;

    console.log(s.slug);
    return s.slug;
  }
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    description: z.string().min(2, {
      message: "Description must be at least 2 characters.",
    }),
    programme: z.string(),
    unitCode: z.string(),
    color: z.string(),
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
      programme: "",
      unitCode: "",
      color: "#abcdef",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // do something with values, submit here
    console.log(values);
    setSubmitState(true);
    loadSlug().then((s) => {
      console.log(s);
      const req = {
        name: values.name,
        description: values.description,
        unit_code: values.unitCode,
        colour: colour.substring(1),
        programme_id: values.programme,
      };
      console.log(req);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/units/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      }).then((r) => {
        if (!r.ok) {
          r.json().then((data) => {
            setAlertText(data.detail);
            setShowAlert(true);
            setSubmitState(false);
          });
        } else {
          toast.success("Unit created. You will be redirected in 1 second.");
          const delay = new Promise((resolve) => setTimeout(resolve, 1000));
          delay.then(() => {
            window.location.href = `/units/`;
          });
          setSubmitState(false);
        }
      });
    });
  }

  const name = form.watch("name");
  const description = form.watch("description");
  const unitCode = form.watch("unitCode");
  const programme = form.watch("programme");
  const colour = form.watch("color");
  return (
    <div className="flex flex-1 flex-row gap-4 px-4 sm:justify-center sm:align-center sm:items-center">
      <div className="flex sm:flex-row w-full lg:w-[70%] gap-4 mb-2 h-fit">
        <Card className={"flex-1"}>
          <Progress
            value={step * (100 / 2)}
            className={"rounded-none"}
          ></Progress>
          <CardHeader>
            <CardTitle>Create a Unit</CardTitle>
            <CardDescription>
              Let's create a Unit! There's a couple of steps, but we'll guide
              you through it.
            </CardDescription>
          </CardHeader>
          <CardContent className={"flex flex-col content-between"}>
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
                              Name your Unit
                            </FieldLabel>
                            <Input
                              {...field}
                              id={"form-flow-name"}
                              aria-invalid={fieldState.invalid}
                              placeholder={"My amazing unit"}
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
                              Give Your Unit a Description
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
                      {/* Select the Unit Code */}
                      <Controller
                        name={"unitCode"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={"form-flow-unitCode"}>
                              Unit Code
                            </FieldLabel>
                            <div className="w-30">
                              <Input
                                {...field}
                                id={"form-flow-unitCode"}
                                aria-invalid={fieldState.invalid}
                                placeholder={"A unit code"}
                                autoComplete={"off"}
                                maxLength={12}
                                className="w-30"
                              />
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />

                      {/* Select the programme it's part of */}
                      <Controller
                        name={"programme"}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={"form-flow-programme"}>
                              Programme
                            </FieldLabel>

                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                const selectedProgramme = programmes.find(
                                  (p) => value === p.id,
                                );
                                if (selectedProgramme) {
                                  setProgrammeName(selectedProgramme.name);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Select Programme" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {programmes.map((programme) => (
                                    <SelectItem
                                      key={programme.id}
                                      value={programme.id}
                                    >
                                      {programme.name}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      {/* <div className="flex flex-row"> */}
                      {/* <Button type={"button"} variant={"outline"}
                          onClick={() => {
                            form
                              .trigger(["name", "description", "programme"])
                              .then((_result) => {
                                if (form.formState.isValid) {
                                  next();
                                }
                              });
                          }}
                        >
                          Back
                        </Button> */}
                      <Button
                        className="bg-black text-white hover:bg-zinc-700 hover:text-white hover:cursor-pointer"
                        type={"button"}
                        variant={"outline"}
                        onClick={() => {
                          form
                            .trigger(["name", "description", "programme"])
                            .then((_result) => {
                              if (form.formState.isValid) {
                                next();
                              }
                            });
                        }}
                      >
                        Next
                        <ArrowRight />
                      </Button>
                      {/* </div> */}
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
                              Choose a colour for your Unit.
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
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                      {/* <Button
                        type={"button"}
                        variant={"outline"}
                        onClick={() => next()}
                      >
                        Next
                      </Button> */}
                      <div className="flex flex-col w-full gap-2">
                        <Button
                          className="bg-black text-white hover:bg-zinc-700 hover:text-white hover:cursor-pointer"
                          type={"button"}
                          variant={"outline"}
                          onClick={() => {
                            form.trigger(["color"]).then((_result) => {
                              if (form.formState.isValid) {
                                next();
                              }
                            });
                          }}
                        >
                          Next
                          <ArrowRight />
                        </Button>
                        <Button
                          className="hover:cursor-pointer"
                          type={"button"}
                          variant={"outline"}
                          onClick={() => {
                            form.trigger([]).then((_result) => {
                              if (form.formState.isValid) {
                                back();
                              }
                            });
                          }}
                        >
                          <ArrowLeft />
                          Back
                        </Button>
                      </div>
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
                            <ItemTitle>Unit name</ItemTitle>
                            <ItemDescription>
                              {name ? name : "Not provided."}
                            </ItemDescription>
                            <ItemTitle>Unit description</ItemTitle>
                            <ItemDescription>
                              {description ? description : "Not provided."}
                            </ItemDescription>
                            <ItemTitle>Unit code</ItemTitle>
                            <ItemDescription>
                              {unitCode ? unitCode : "Not provided."}
                            </ItemDescription>
                            <ItemTitle>Programme</ItemTitle>
                            <ItemDescription>
                              {programme ? programmeName : "Not provided."}
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

                      {submitState && (
                        <Button
                          disabled={true}
                          type={"submit"}
                          variant={"outline"}
                          className="bg-black text-white hover:bg-zinc-700 hover:cursor-pointer"
                        >
                          <Spinner />
                          Submit
                        </Button>
                      )}

                      {!submitState && (
                        <Button
                          type={"submit"}
                          variant={"outline"}
                          className="bg-black text-white hover:bg-zinc-700 hover:text-white hover:cursor-pointer"
                        >
                          Submit
                          <Send />
                        </Button>
                      )}
                      <Button
                        className="hover:cursor-pointer -mt-5"
                        type={"button"}
                        variant={"outline"}
                        onClick={() => {
                          form.trigger([]).then((_result) => {
                            if (form.formState.isValid) {
                              back();
                            }
                          });
                        }}
                      >
                        <ArrowLeft />
                        Back
                      </Button>

                      {showAlert && (
                        <Alert variant="destructive">
                          <Terminal />
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

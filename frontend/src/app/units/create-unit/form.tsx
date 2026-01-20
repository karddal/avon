
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";
import { easeIn, easeOut } from "motion";
import { redirect } from "next/navigation";
import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Calendar29 } from "@/components/calendar";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { multistep_coursework_flow } from "./multistep_coursework_flow";

interface FormProps {
    slug: Promise<{ slug: string }>;
}

export const IntForm: React.FC<FormProps> = ({ slug }) => {
    const [submitState, setSubmitState] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertText, setAlertText] = useState<string>("");
    const { step, setStep, next } = multistep_coursework_flow();
    const today = new Date();

    async function loadSlug(): Promise<string> {
        const s = await slug;

        console.log(s.slug);
        return s.slug;
    }
    today.setHours(13, 0, 0, 0);

    today.setDate(today.getDate() + 1);
    const formSchema = z.object({
        name: z.string().min(2, {
            message: "Name must be at least 2 characters.",
        }),
        description: z.string().min(2, {
            message: "Description must be at least 2 characters.",
        }),
        color: z.string(),
        due_date: z.date().min(today, {
            message: "Due date must be at least tomorrow.",
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
            name: "",
            description: "",
            due_date: today,
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
                unit_id: s,
                due_date: values.due_date.toISOString(),
                colour: colour.substring(1),
            };
            console.log(req);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/coursework/create`, {
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
                    toast.success(
                        "Coursework created. You will be redirected in 1 second.",
                    );
                    const delay = new Promise((resolve) => setTimeout(resolve, 1000));
                    delay.then(() => {
                        redirect(`/units/${s}`);
                    });
                    setSubmitState(false);
                }
            });
        });
    }

    const name = form.watch("name");
    const description = form.watch("description");
    const colour = form.watch("color");
    return (
        <div className="flex flex-1 flex-row gap-4 px-4 sm:justify-center sm:align-center sm:items-center">
            <div className="flex flex-col sm:flex-row w-full lg:w-[70%] gap-4 min-h-150 h-fit mb-2">
                <Card
                    className={
                        "h-fit w-fit flex flex-row sm:flex-col items-center justify-center gap-4 px-4"
                    }
                >
                    <CardContent
                        className={"flex flex-row sm:flex-col justify-center gap-2 p-0"}
                    >
                        <CardTitle>Steps</CardTitle>
                        <p
                            onKeyDown={(e) => {
                                e.key === "Enter" && setStep(0);
                            }}
                            onClick={() => setStep(0)}
                            className={`${step === 0
                                ? "underline decoration-line decoration-2 decoration-yellow-300"
                                : ""
                                } cursor-pointer`}
                        >
                            Step 1
                        </p>
                        <p
                            onKeyDown={(e) => {
                                e.key === "Enter" && setStep(1);
                            }}
                            onClick={() => setStep(1)}
                            className={`${step === 1
                                ? "underline decoration-line decoration-2 decoration-yellow-300"
                                : ""
                                } cursor-pointer`}
                        >
                            Step 2
                        </p>
                        <p
                            onKeyDown={(e) => {
                                e.key === "Enter" && setStep(2);
                            }}
                            onClick={() => setStep(2)}
                            className={`${step === 2
                                ? "underline decoration-line decoration-2 decoration-yellow-300"
                                : ""
                                } cursor-pointer`}
                        >
                            Step 3
                        </p>
                    </CardContent>
                </Card>
                <Card className={"flex-1"}>
                    <CardHeader>
                        <CardTitle>Create a Unit</CardTitle>
                        <CardDescription>
                            Let's create a Unit! There's a couple of steps, but we'll
                            guide you through it.
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
                                                            Give your Unit a description
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
                                                            Choose the academic year for the Unit
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
                                                variant={"outline"}
                                                onClick={() => {
                                                    form
                                                        .trigger(["name", "description", "due_date"])
                                                        .then((_result) => {
                                                            if (form.formState.isValid) {
                                                                next();
                                                            }
                                                        });
                                                }}
                                            >
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
                                                                    e.key === "Enter" && field.onChange("ff6467");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("ff6467");
                                                                }}
                                                                className=" aspect-square border-2 border-input hover:bg-red-300 cursor-pointer size-8 rounded-none bg-red-400"
                                                            ></span>
                                                            <span
                                                                tabIndex={0}
                                                                role={"option"}
                                                                onKeyDown={(e) => {
                                                                    e.key === "Enter" && field.onChange("e17100");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("e17100");
                                                                }}
                                                                className=" aspect-square border-2 border-input hover:bg-amber-300 cursor-pointer size-8 rounded-none bg-amber-400"
                                                            ></span>
                                                            <span
                                                                tabIndex={0}
                                                                role={"option"}
                                                                onKeyDown={(e) => {
                                                                    e.key === "Enter" && field.onChange("05df72");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("05df72");
                                                                }}
                                                                className=" aspect-square border-2 border-input hover:bg-green-300 cursor-pointer size-8 rounded-none bg-green-400"
                                                            ></span>
                                                            <span
                                                                tabIndex={0}
                                                                role={"option"}
                                                                onKeyDown={(e) => {
                                                                    e.key === "Enter" && field.onChange("51a2ff");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("51a2ff");
                                                                }}
                                                                className=" aspect-square border-2 border-input hover:bg-blue-300 cursor-pointer size-8 rounded-none bg-blue-400"
                                                            ></span>
                                                            <span
                                                                tabIndex={0}
                                                                role={"option"}
                                                                onKeyDown={(e) => {
                                                                    e.key === "Enter" && field.onChange("c27aff");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("c27aff");
                                                                }}
                                                                className=" aspect-square border-2 border-input hover:bg-purple-300 cursor-pointer size-8 rounded-none bg-purple-400"
                                                            ></span>
                                                            <span
                                                                tabIndex={0}
                                                                role={"option"}
                                                                onKeyDown={(e) => {
                                                                    e.key === "Enter" && field.onChange("fb64b6");
                                                                }}
                                                                onClick={() => {
                                                                    field.onChange("fb64b6");
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
                                            <Button
                                                type={"button"}
                                                variant={"outline"}
                                                onClick={() => next()}
                                            >
                                                Next
                                            </Button>
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
                                                        <ItemTitle>Academic Year</ItemTitle>
                                                        <ItemDescription>
                                                            Year here
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
                                                >
                                                    <Spinner />
                                                    Submit
                                                </Button>
                                            )}
                                            {!submitState && (
                                                <Button type={"submit"} variant={"outline"}>
                                                    Submit
                                                </Button>
                                            )}

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

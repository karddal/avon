"use client"

import {multistep_coursework_flow} from "@/app/flows/multistep_coursework_flow";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

import * as z from "zod"
import {Field, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {easeIn, easeInOut, easeOut} from "motion";
import {HexColorInput, HexColorPicker} from "react-colorful";
import {Select, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Separator} from "@/components/ui/separator";
import {Calendar} from "@/components/ui/calendar";
import {Calendar29} from "@/components/calendar";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useState} from "react";

const today = new Date();
today.setHours(0, 0, 0, 0);
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    description: z.string().min(2, {
        message: "Description must be at least 2 characters.",
    }),
    color: z.string(),
    due_date: z.date().min(today, {
        message: "Due date cannot be in the past."
    })
})

export default function CreateCourseworkFlow() {
    "use client"
    const {
        step,
        setStep,
        submit,
        go_step,
        next,
        back
    } = multistep_coursework_flow();

    const formVariants = {
        hidden: {
            opacity: 0,
            x: -50,
        },
        visible: {
            opacity: 1,
            x:0,
            transition: {
                ease: easeIn,
            }
        },
        exit: {
            opacity: 0,
            x: 50,
            transition: {
                ease: easeOut
            }
        }
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            due_date: today,
            color: "#abcdef"
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        // do something with values, submit here
        console.log(values)
    }

    function onTest(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    const name = form.watch("name");
    const description = form.watch("description");
    const colour = form.watch("color");
    return (
        <div className="flex flex-col sm:flex-row w-full lg:w-[70%] gap-4 min-h-150 h-fit mb-2">
            <Card className={"h-fit w-fit flex flex-row sm:flex-col items-center justify-center gap-4 px-4"}>
                <CardContent className={"flex flex-row sm:flex-col justify-center gap-2 p-0"}>
                    <CardTitle>Steps</CardTitle>
                    <p onClick={() => setStep(0)} className={`${step === 0 ? "underline decoration-line decoration-2 decoration-yellow-300" : ""} cursor-pointer`}>Step 1</p>
                    <p onClick={() => setStep(1)} className={`${step === 1 ? "underline decoration-line decoration-2 decoration-yellow-300" : ""} cursor-pointer`}>Step 2</p>
                    <p onClick={() => setStep(2)} className={`${step === 2 ? "underline decoration-line decoration-2 decoration-yellow-300" : ""} cursor-pointer`}>Step 3</p>
                </CardContent>
            </Card>
            <Card className={"flex-1"}>
                <CardHeader>
                    <CardTitle>Create a coursework</CardTitle>
                    <CardDescription>Let's create a coursework! There's a couple of steps, but we'll guide you through it.</CardDescription>
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
                                    exit={"exit"}>
                                    <FieldGroup>
                                        <Controller
                                            name={"name"}
                                            control={form.control}
                                            render={({field, fieldState}) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={"form-flow-name"}>
                                                        Name your coursework
                                                    </FieldLabel>
                                                    <Input
                                                        {...field}
                                                        id={"form-flow-name"}
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder={"My amazing coursework"}
                                                        autoComplete={"off"}/>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]}/>
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name={"description"}
                                            control={form.control}
                                            render={({field, fieldState}) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={"form-flow-description"}>
                                                        Give your coursework a description
                                                    </FieldLabel>
                                                    <Textarea
                                                        {...field}
                                                        id={"form-flow-description"}
                                                        aria-invalid={fieldState.invalid}
                                                        placeholder={"A great description"}
                                                        autoComplete={"off"}/>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]}/>
                                                    )}
                                                </Field>
                                            )}/>
                                        <Controller
                                            name={"due_date"}
                                            control={form.control}
                                            render={({field, fieldState}) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={"form-flow-date"}>
                                                        Choose the due date for the coursework
                                                    </FieldLabel>
                                                    <Calendar29 props={{date: field.value, setDate: field.onChange}}/>
                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]}/>
                                                    )}
                                                </Field>
                                            )}
                                            >

                                        </Controller>
                                        <Button type={"button"} variant={"outline"} onClick={() =>{
                                            form.trigger(["name", "description", "due_date"]).then((result)=> {
                                                if (form.formState.isValid) {
                                                    next()
                                                }
                                            })

                                        }}>
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
                                    exit={"exit"}>
                                    <FieldGroup>
                                        <Controller
                                            name={"color"}
                                            control={form.control}
                                            render={({field, fieldState}) => (
                                                <Field data-invalid={fieldState.invalid}>
                                                    <FieldLabel htmlFor={"form-flow-description"}>
                                                        Choose a colour for your coursework.
                                                    </FieldLabel>
                                                    <div className={"flex flex-row flex-wrap gap-2 w-full justify-items-center align-items-center"}>
                                                        <span onClick={() => {field.onChange("ff6467")}} className=" aspect-square border-2 border-input hover:bg-red-300 cursor-pointer size-8 rounded-none bg-red-400"></span>
                                                        <span onClick={() => {field.onChange("e17100")}} className=" aspect-square border-2 border-input hover:bg-amber-300 cursor-pointer size-8 rounded-none bg-amber-400"></span>
                                                        <span onClick={() => {field.onChange("05df72")}} className=" aspect-square border-2 border-input hover:bg-green-300 cursor-pointer size-8 rounded-none bg-green-400"></span>
                                                        <span onClick={() => {field.onChange("51a2ff")}} className=" aspect-square border-2 border-input hover:bg-blue-300 cursor-pointer size-8 rounded-none bg-blue-400"></span>
                                                        <span onClick={() => {field.onChange("c27aff")}} className=" aspect-square border-2 border-input hover:bg-purple-300 cursor-pointer size-8 rounded-none bg-purple-400"></span>
                                                        <span onClick={() => {field.onChange("fb64b6")}} className=" aspect-square border-2 border-input hover:bg-pink-300 cursor-pointer size-8 rounded-none bg-pink-400"></span>
                                                    </div>
                                                    or pick from the picker below:
                                                    <div className={"flex flex-col justify-items-center align-center gap-2 w-[30%]!"}>
                                                        <HexColorPicker
                                                            className={"w-full! border-2 border-input"}
                                                            color={field.value}
                                                            onChange={(color) => {
                                                                field.onChange(color);
                                                            }}
                                                        />
                                                        <HexColorInput prefixed={true}
                                                                       className={"border bg-accent p-2 border-2 border-input"}
                                                                       color={field.value} onChange={(color) => {
                                                            field.onChange(color);
                                                        }}/>
                                                    </div>

                                                    {fieldState.invalid && (
                                                        <FieldError errors={[fieldState.error]}/>
                                                    )}
                                                </Field>
                                            )}/>
                                        <Button type={"button"} variant={"outline"} onClick={() => next()}>
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
                                    exit={"exit"}>
                                    <CardHeader className={"p-0"}>
                                        <CardTitle className={"font-medium text-sm"}>Summary</CardTitle>
                                        <CardDescription>Here's a summary of the information you've provided.</CardDescription>
                                    </CardHeader>
                                    <FieldGroup className={"flex flex-col content-between h-full"}>
                                        <div className={"flex flex-col"}>
                                            <Item variant={"muted"}>
                                                <ItemContent>
                                                    <ItemTitle>
                                                        Coursework name
                                                    </ItemTitle>
                                                    <ItemDescription>
                                                        {name ? name : "Not provided."}
                                                    </ItemDescription>
                                                    <ItemTitle>
                                                        Coursework description
                                                    </ItemTitle>
                                                    <ItemDescription>
                                                        {description ? description : "Not provided."}
                                                    </ItemDescription>
                                                    <ItemTitle>
                                                        Colour
                                                    </ItemTitle>
                                                    <ItemDescription>
                                                        {colour}
                                                    </ItemDescription>
                                                    <p style={{ backgroundColor: colour }} className="aspect-square border-2 border-input size-8 rounded-none "/>
                                                </ItemContent>

                                            </Item>
                                        </div>

                                        <Button type={"submit"} variant={"outline"}>
                                            Submit
                                        </Button>
                                    </FieldGroup>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
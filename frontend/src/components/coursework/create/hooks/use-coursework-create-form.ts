import type {FormProps} from "@/components/coursework/create/types"
import {useCallback, useEffect, useMemo, useState} from "react";
import {useCourseworkCreateClose} from "@/components/coursework/coursework-create-close";
import {
    CourseworkFormValues,
    createCourseworkSchema
} from "@/components/coursework/create/utils/coursework-form-schema";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    buildDefaultDueDate,
    validateDueDateAgainstUnitEnd
} from "@/components/coursework/create/utils/courseowrk-form-helpers";
import {DEFAULT_COLOUR} from "@/components/coursework/create/utils/coursework-form-constants";
import {useUnitDetails} from "@/components/coursework/create/hooks/use-unit-details";
import {create_coursework} from "@/lib/actions/create_coursework";
import {toast} from "sonner";

export function useCourseworkCreateForm({ units }: FormProps) {
    const [submitState, setSubmitState] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertText, setAlertText] = useState("")
    const [step, setStep] = useState<"details" | "colour" | "summary">("details")
    const { setBeforeClose } = useCourseworkCreateClose()

    const today = useMemo(() => new Date(), [])
    const schema = useMemo(() => createCourseworkSchema(today), [today])

    const form = useForm<CourseworkFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            unit_id: "",
            name: "",
            description: "",
            due_date: buildDefaultDueDate(),
            color: DEFAULT_COLOUR,
        },
        mode: "onTouched",
    })

    const selectedUnitId = form.watch("unit_id")
    const selectedUnitSummary = useMemo(
        () => units.find((unit) => unit.id === selectedUnitId) ?? null,
        [units, selectedUnitId],
    )

    const {data: selectedUnitData, loading, error} = useUnitDetails(selectedUnitId)

    useEffect(() => {
        const dueDate = form.getValues("due_date")
        const dueDateError = validateDueDateAgainstUnitEnd(dueDate, selectedUnitData?.end_date)

        if (dueDateError) {
            form.setError("due_date", {
                type: "manual",
                message: dueDateError,
            })
        } else {
            form.clearErrors("due_date")
        }
    }, [selectedUnitData, form])

    const goNext = () => {
        if (step === "details") setStep("colour")
        else if (step === "colour") setStep("summary")
    }

    const goBack = () => {
        if (step === "summary") setStep("colour")
        else if (step === "colour") setStep("details")
    }

    const resetAll = useCallback(() => {
        form.clearErrors()
        form.reset(
            {
                unit_id: "",
                name: "",
                description: "",
                due_date: buildDefaultDueDate(),
                color: DEFAULT_COLOUR,
            },
            {
                keepErrors: false,
                keepTouched: false,
                keepDirty: false,
                keepIsSubmitted: false,
                keepSubmitCount: false,
            },
        )
        setSubmitState(false)
        setShowAlert(false)
        setAlertText("")
        setStep("details")
    }, [form])

    useEffect(() => {
        setBeforeClose(() => resetAll)
        return () => setBeforeClose(null)
    }, [resetAll, setBeforeClose])

    async function validateDetailsStep() {
        setShowAlert(false)
        setAlertText("")

        const baseValid = await form.trigger([
            "unit_id",
            "name",
            "description",
            "due_date",
        ])

        if (!baseValid) return false

        if (!selectedUnitId) {
            form.setError("unit_id", {
                type: "manual",
                message: "Please choose a unit.",
            })
            return false
        }

        if (loading) {
            setShowAlert(true)
            setAlertText("Please wait for the selected unit details to finish loading.")
            return false
        }

        if (error || !selectedUnitData) {
            setShowAlert(true)
            setAlertText(error ?? "Could not load unit details.")
            return false
        }

        const dueDateError = validateDueDateAgainstUnitEnd(form.getValues("due_date"), selectedUnitData.end_date)

        if (dueDateError) {
            form.setError("due_date", {
                type: "manual",
                message: dueDateError,
            })
            return false
        }

        form.clearErrors("due_date")
        return true
    }

    async function onSubmit(values: CourseworkFormValues) {
        setSubmitState(true)
        setShowAlert(false)
        setAlertText("")

        if (!selectedUnitData) {
            setAlertText("Please choose a unit and wait for its details to load.")
            setShowAlert(true)
            setSubmitState(false)
            return
        }

        const dueDateError = validateDueDateAgainstUnitEnd(values.due_date, selectedUnitData?.end_date)

        if (dueDateError) {
            setAlertText(dueDateError)
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
        }

        const result = await create_coursework(req)

        if (!result.success) {
            setAlertText(result.data.detail)
            setShowAlert(true)
            setSubmitState(false)
            return
        }

        toast.success("Coursework created.")
        resetAll()
        window.location.href = "/coursework"
    }

    return {
        form,
        step,
        goNext,
        goBack,
        setStep,
        onSubmit,
        validateDetailsStep,
        selectedUnitData,
        selectedUnitSummary,
        selectedUnitLoading: loading,
        selectedUnitError: error,
        submitState,
        showAlert,
        alertText,
    }
}
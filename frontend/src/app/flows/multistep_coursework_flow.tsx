"use client"
import {useState} from "react";

// adapted from github.com/Marcosfitzsimons/multi-step-form

export function multistep_coursework_flow() {
    const steps = 3;
    const [step, setStep] = useState<number>(0);
    const [submit, setSubmit] = useState<boolean>(true);

    const next = () => {
        if (step < steps - 1) {
            setStep((i) => i + 1);
        }
        if (step === steps) {
            setSubmit(true);
        }
    }

    const back = () => {
        if (step > 0) {
            setStep((i) => i - 1);
        }
    }

    const go_step = (step_index: number) => {
        setStep(step_index);
    }

    return {
        step,
        setStep,
        submit,
        go_step,
        next,
        back
    }
}
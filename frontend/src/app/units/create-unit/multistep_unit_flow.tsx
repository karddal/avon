"use client";
import { useState } from "react";

// adapted from github.com/Marcosfitzsimons/multi-step-form

export function multistep_unit_flow() {
  const steps = 3;
  const [step, setStep] = useState<number>(0);

  const next = () => {
    if (step < steps - 1) {
      setStep((i) => i + 1);
    }
  };

  const back = () => {
    if (step > 0) {
      setStep((i) => i - 1);
    }
  };

  const go_step = (step_index: number) => {
    setStep(step_index);
  };

  return {
    step,
    setStep,
    go_step,
    next,
    back,
  };
}

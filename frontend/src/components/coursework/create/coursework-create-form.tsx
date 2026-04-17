"use client";

import { AnimatePresence, motion } from "framer-motion";

import { easeIn, easeOut } from "motion";
import Link from "next/link";
import { useCourseworkCreateForm } from "@/components/coursework/create/hooks/use-coursework-create-form";
import { CourseworkColourStep } from "@/components/coursework/create/steps/coursework-colour-step";
import { CourseworkDetailsStep } from "@/components/coursework/create/steps/coursework-details-step";
import { CourseworkSummaryStep } from "@/components/coursework/create/steps/coursework-summary-step";
import type { FormProps } from "@/components/coursework/create/types";
import { getStepProgress } from "@/components/coursework/create/utils/courseowrk-form-helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const formVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { ease: easeIn },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { ease: easeOut },
  },
};

export function CourseworkCreateForm(props: FormProps) {
  const courseworkForm = useCourseworkCreateForm(props);

  const colour = courseworkForm.form.watch("color");
  const name = courseworkForm.form.watch("name");
  const description = courseworkForm.form.watch("description");
  const dueDate = courseworkForm.form.watch("due_date");

  return (
    <div className="flex w-full justify-center p-6 md:p-8">
      <div className="w-full max-w-3xl">
        <Card className="w-full border-0 text-base shadow-none">
          <Progress
            value={getStepProgress(courseworkForm.step)}
            className="rounded-none"
          />

          <CardHeader>
            <CardTitle data-cy="create-coursework-title">
              Create a coursework
            </CardTitle>
            <CardDescription>
              <p>
                Let's create a coursework! There's a couple of steps, but we'll
                guide you through it.
              </p>

              {courseworkForm.selectedUnitData ? (
                <>
                  You are adding a coursework to{" "}
                  <Link
                    className="text-foreground underline"
                    href={`/units/${courseworkForm.selectedUnitData.id}`}
                  >
                    <span className="font-mono">
                      {courseworkForm.selectedUnitData.unit_code}
                    </span>{" "}
                    {courseworkForm.selectedUnitData.name}
                  </Link>
                  .
                </>
              ) : (
                "Choose a unit to begin."
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex h-full flex-col content-between justify-between">
            <form
              id="form-flow"
              onSubmit={courseworkForm.form.handleSubmit(
                courseworkForm.onSubmit,
              )}
            >
              <AnimatePresence mode="wait">
                {courseworkForm.step === "details" && (
                  <motion.div
                    key="details"
                    initial="visible"
                    animate="visible"
                    exit="exit"
                    variants={formVariants}
                  >
                    <CourseworkDetailsStep
                      form={courseworkForm.form}
                      units={props.units}
                      selectedUnitData={courseworkForm.selectedUnitData}
                      selectedUnitLoading={courseworkForm.selectedUnitLoading}
                      selectedUnitError={courseworkForm.selectedUnitError}
                      onNext={() => {
                        void courseworkForm
                          .validateDetailsStep()
                          .then((valid) => {
                            if (valid) courseworkForm.goNext();
                          });
                      }}
                    />
                  </motion.div>
                )}

                {courseworkForm.step === "colour" && (
                  <motion.div
                    key="colour"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={formVariants}
                  >
                    <CourseworkColourStep
                      form={courseworkForm.form}
                      onBack={courseworkForm.goBack}
                      onNext={courseworkForm.goNext}
                    />
                  </motion.div>
                )}

                {courseworkForm.step === "summary" && (
                  <motion.div
                    key="summary"
                    initial="visible"
                    animate="visible"
                    exit="exit"
                    variants={formVariants}
                  >
                    <CourseworkSummaryStep
                      selectedUnitData={courseworkForm.selectedUnitData}
                      selectedUnitSummary={courseworkForm.selectedUnitSummary}
                      name={name}
                      description={description}
                      dueDate={dueDate}
                      colour={colour}
                      submitState={courseworkForm.submitState}
                      showAlert={courseworkForm.showAlert}
                      alertText={courseworkForm.alertText}
                      onBack={courseworkForm.goBack}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

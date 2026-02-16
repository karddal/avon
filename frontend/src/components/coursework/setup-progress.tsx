import { DropdownCard } from "@/components/dropdown-card";
import { ArrowRight } from "lucide-react";
import { CheckCircle, Circle } from "lucide-react";

interface setupProgress {
  title: string;
  completed: boolean;
}

interface StepList {
  steps: setupProgress[]
}

export default async function SetupPogress({steps} : StepList) {
  return (
    // Need to use reusable components for the buttons and sections, just place with names or smth
    // Add links to each one and actually do backend for it as well
    <DropdownCard
      title={"Setup Progress"}
      desc={"View the progress in setting up the coursework"}
      openByDefault={true}
    > 
      <div className="flex flex-col">
        {steps.map((step, index) => 
          <div key={step.title}>
            {step.completed && (
              <div className="flex items-center justify-between rounded-xl 
            border border-green-500/30 bg-green-500/5 
            p-4 shadow-sm transition-all 
            hover:shadow-md hover:-translate-y-0.5">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {step.title}
                </h3>

                <div className="flex h-8 w-8 items-center justify-center 
                  rounded-full bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}
            {!step.completed && (
              <div className="flex items-center justify-between rounded-xl 
            border border-border bg-card 
            p-4 shadow-sm transition-all 
            hover:shadow-md hover:-translate-y-0.5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {step.title}
                </h3>

                <div className="flex h-8 w-8 items-center justify-center 
                  rounded-full bg-muted">
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
            {steps.length - 1 > index && (
              <div className="flex justify-center py-3">
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
              </div>
            )}
          </div>
        )}
      </div>
    </DropdownCard>
  );
}

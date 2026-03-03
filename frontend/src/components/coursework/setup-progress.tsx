import { ArrowRight, CheckCircle, Circle } from "lucide-react";
import { DropdownCard } from "@/components/dropdown-card";
import { cw_setup_progress } from "@/lib/actions/coursework-setup-progress";

interface setupProgress {
  cw_id: string;
}

export default async function SetupPogress({ cw_id }: setupProgress) {
  const steps = await cw_setup_progress(cw_id);
  return (
    // Need to use reusable components for the buttons and sections, just place with names or smth
    // Add links to each one and actually do backend for it as well
    <DropdownCard
      title={"Setup Progress"}
      desc={"View the progress in setting up the coursework"}
      openByDefault={true}
    >
      <div className="flex flex-col xl:flex-row items-center justify-center">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col xl:flex-row items-center w-full xl:w-auto"
          >
            {step.completed && (
              <div
                className="flex w-full xl:w-auto items-center justify-between rounded-xl 
            border border-green-500/30 bg-green-500/5 
            p-4 shadow-sm transition-all 
            hover:shadow-md hover:-translate-y-0.5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  {step.title}
                </h3>

                <div
                  className="flex h-8 w-8 items-center justify-center 
                  rounded-full bg-green-500/10 ml-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            )}
            {!step.completed && (
              <div
                className="flex w-full xl:w-auto items-center justify-between rounded-xl 
            border border-border bg-card 
            p-4 shadow-sm transition-all 
            hover:shadow-md hover:-translate-y-0.5"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {step.title}
                </h3>

                <div
                  className="flex h-8 w-8 items-center justify-center 
                  rounded-full bg-muted ml-3"
                >
                  <Circle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
            {steps.length - 1 > index && (
              <div className="flex items-center px-3 py-3 md:py-0">
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90 xl:rotate-0" />
              </div>
            )}
          </div>
        ))}
      </div>
    </DropdownCard>
  );
}

import { ArrowRight, CheckCircle, Circle, CircleDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cw_setup_progress } from "@/lib/actions/coursework/coursework-setup-progress";

interface setupProgress {
  cw_id: string;
}

export default async function SetupProgress({ cw_id }: setupProgress) {
  const steps = await cw_setup_progress(cw_id);
  return (
    <Card data-cy="coursework-setup-progress" className="h-full">
      <CardHeader className="flex flex-col ">
        <CardTitle>
          <div className="text-2xl flex flex-row items-center gap-2">
            <CircleDashed />
            Setup Progress
          </div>
          <div className="font-light">
            View the progress in setting up the coursework.
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center w-full">
              {step.completed && (
                <div
                  className="flex w-full items-center justify-between rounded-xl 
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
                  className="flex w-full items-center justify-between rounded-xl 
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
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

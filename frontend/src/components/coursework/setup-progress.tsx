import { CalendarDays, Clock } from "lucide-react";
import { DropdownCard } from "@/components/dropdown-card";
import { ArrowRight } from "lucide-react";
import { CheckCircle, Circle } from "lucide-react";

export default async function SetupPogress() {
  return (
    // Need to use reusable components for the buttons and sections, just place with names or smth
    <DropdownCard
      title={"Setup Progress"}
      desc={"View the progress in setting up the coursework"}
      openByDefault={true}
    > 
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between rounded-xl 
          border border-green-500/30 bg-green-500/5 
          p-4 shadow-sm transition-all 
          hover:shadow-md hover:-translate-y-0.5">

          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Create Template Repository
          </h3>

          <div className="flex h-8 w-8 items-center justify-center 
            rounded-full bg-green-500/10">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
        </div>

        <div className="flex items-center justify-between rounded-xl 
          border border-green-500/30 bg-green-500/5 
          p-4 shadow-sm transition-all 
          hover:shadow-md hover:-translate-y-0.5">

          <h3 className="text-sm font-semibold uppercase tracking-wide">
            Create Dockerfile
          </h3>

          <div className="flex h-8 w-8 items-center justify-center 
            rounded-full bg-green-500/10">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
        </div>

        <div className="flex items-center justify-between rounded-xl 
          border border-border bg-card 
          p-4 shadow-sm transition-all 
          hover:shadow-md hover:-translate-y-0.5">

          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Create Engine
          </h3>

          <div className="flex h-8 w-8 items-center justify-center 
            rounded-full bg-muted">
            <Circle className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground/40 rotate-90" />
        </div>

        <div className="flex items-center justify-between rounded-xl 
          border border-border bg-card 
          p-4 shadow-sm transition-all 
          hover:shadow-md hover:-translate-y-0.5">

          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Provision Repositories
          </h3>

          <div className="flex h-8 w-8 items-center justify-center 
            rounded-full bg-muted">
            <Circle className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

      </div>

    </DropdownCard>
  );
}

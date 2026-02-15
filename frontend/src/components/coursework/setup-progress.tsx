import { CalendarDays, Clock } from "lucide-react";
import { DropdownCard } from "@/components/dropdown-card";
import { ArrowRight } from "lucide-react";

export default async function SetupPogress() {
  return (
    <DropdownCard
      title={"Setup Progress"}
      desc={"View the progress in setting up the coursework"}
      openByDefault={true}
    > 
      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Create Template Repository
        </h3>
      </div>

      <div className="flex shrink-0 justify-center">
        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90"/>
      </div>

      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Create Dockerfile
        </h3>
      </div>

      <div className="flex shrink-0 justify-center">
        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90"/>
      </div>

      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Create Engine
        </h3>
      </div>

      <div className="flex shrink-0 justify-center">
        <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90"/>
      </div>

      <div className="rounded-md border border-border p-4">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Provision Repositories
        </h3>
      </div>

    </DropdownCard>
  );
}

"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Eye, Pointer, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CreateStructurePage() {
  const [selectedYears, setSelectedYears] = useState([
    "Year 1",
    "Year 2",
    "Year 3",
  ]);
  const years = ["Year 1", "Year 2", "Year 3"];
  const [previewLoaded, setPreviewLoaded] = useState<boolean>(false);
  const [structureLink, setStructureLink] = useState<string>();

  function toggleYear(year: string) {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  }

  function handlePreview(link: string) {}

  return (
    <div className="space-y-6 flex justify-center align-center items-center h-full">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <Card className="flex-1">
          <CardContent className="flex flex-col gap-8">
            <div className="flex flex-col gap-0">
              <CardTitle className="text-xl">Create Structure</CardTitle>
              <p className="text-muted-foreground">
                Create a structure for a programme automatically below.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>Link to programme catalogue</CardTitle>
              <p className="text-muted-foreground text-sm">
                An example can be seen{" "}
                <Link
                  className="font-bold inline-flex flex-row gap-1 justify-baseline"
                  href="https://www.bris.ac.uk/unit-programme-catalogue/RouteStructureCohort.jsa?ayrCode=26/27&byCohort=Y&programmeCode=4COSC006U"
                >
                  here
                </Link>
                .
              </p>
              <Input
                placeholder="https://www.bris.ac.uk/unit-programme-catalogue/..."
                value={structureLink}
                onChange={(e) => setStructureLink(e.target.value)}
              ></Input>
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle>Select Year(s)</CardTitle>
              <p className="text-muted-foreground text-sm">
                Choose what year(s) to automatically create the structure for.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {years.map((year) => {
                  const isActive = selectedYears.includes(year);

                  return (
                    <Card
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={cn(
                        "px-4 py-2 cursor-pointer transition-all flex items-center gap-2 select-none flex-row border",
                        isActive
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "bg-card hover:border-primary/50",
                      )}
                    >
                      {isActive && <Check className="w-3 h-3 text-primary" />}

                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {year}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant={"outline"}
                onClick={() => handlePreview(structureLink)}
              >
                <Eye></Eye>Preview Structure
              </Button>
              <Button variant={"default"} disabled={previewLoaded === false}>
                <Send></Send>Confirm & Add Structure
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent>
            <div className="flex flex-col gap-0">
              <CardTitle className="text-xl">Preview</CardTitle>
              <p className="text-muted-foreground">
                A preview of the proposed structure will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

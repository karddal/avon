"use client";

import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Loader2,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getStructurePreview,
  type ProgrammePreview,
  type StructurePreviewResponse,
  sendStructure,
  type UnitPreview,
} from "@/lib/actions/structure";
import { cn } from "@/lib/utils";

export default function CreateStructurePage() {
  const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
  const [selectedYears, setSelectedYears] = useState<string[]>(["Year 1"]);
  const [structureLink, setStructureLink] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] =
    useState<StructurePreviewResponse | null>(null);
  const [expandedProgrammes, setExpandedProgrammes] = useState<Set<number>>(
    new Set(),
  );

  async function handlePreview() {
    if (!structureLink) return;
    setIsLoading(true);

    const data = await getStructurePreview(structureLink, selectedYears.sort());
    setPreviewData(data);
    setExpandedProgrammes(
      new Set(data?.results.map((_: ProgrammePreview, i: number) => i) ?? []),
    );
    setIsLoading(false);
  }

  async function handleSend() {
    if (!previewData) {
      toast.error("Select some preview data first!");
      return;
    }
    const response = await sendStructure(previewData);
    if (response) {
      toast.success("Created entire structure!");
    } else {
      toast.error("Structure creation failed!");
    }
  }

  function toggleYear(year: string) {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  }

  function toggleProgramme(index: number) {
    setExpandedProgrammes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6 items-center flex justify-center h-full">
      <div className="flex flex-col-reverse lg:flex-row gap-6 w-full max-w-7xl">
        <Card className="flex-1 shadow-sm border-muted/60">
          <CardContent className="flex flex-col gap-8 h-full">
            <div>
              <CardTitle className="text-2xl font-bold">
                Create Structure
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Scrape programme units directly from the University of Bristol
                catalogue.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Programme Catalogue Link</CardTitle>
                <p className="text-sm text-muted-foreground">
                  The link must contain <strong>programmeCode</strong> and{" "}
                  <strong>ayrCode</strong>.
                </p>
              </div>

              <Input
                placeholder="https://www.bris.ac.uk/unit-programme-catalogue/..."
                value={structureLink}
                onChange={(e) => setStructureLink(e.target.value)}
                className="bg-muted/20"
              />
            </div>

            <div className="space-y-4">
              <CardTitle>Select Year(s)</CardTitle>
              <div className="grid grid-cols-2 gap-3">
                {years.map((year) => {
                  const isActive = selectedYears.includes(year);
                  return (
                    <Card
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={cn(
                        "px-4 py-3 cursor-pointer transition-all flex items-center gap-2 hover:border-primary select-none flex-row justify-between",
                        isActive ? "border-primary bg-primary/5" : "bg-card",
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isActive && "text-primary font-semibold",
                        )}
                      >
                        {year}
                      </span>
                      <div
                        className={cn(
                          "w-5 h-5 flex items-center justify-center transition-all",
                        )}
                      >
                        {isActive && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto pb-4">
              <Button
                size="lg"
                onClick={handlePreview}
                disabled={isLoading || !structureLink}
                className="w-full font-bold"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Eye className="mr-2 w-4 h-4" />
                )}
                Preview Structure
              </Button>
              <Button
                variant="outline"
                size="lg"
                disabled={!previewData || isLoading}
                onClick={handleSend}
                className="w-full"
              >
                <Send className="mr-2 w-4 h-4" /> Confirm & Add Structure
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-sm border-muted/60 flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="mb-6">
              <CardTitle className="text-2xl font-bold">Preview</CardTitle>
              <p className="text-muted-foreground text-sm">
                Preview of the structure will appear below.
              </p>
              {!previewData && (
                <div className="mt-20 flex flex-col items-center text-center px-10">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Eye className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    No data to display. Paste a link and click preview to see
                    the programme structure.
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-scroll max-h-100 pr-2 space-y-8 p-2">
              {previewData?.results.map((prog: ProgrammePreview, i: number) => {
                const isExpanded = expandedProgrammes.has(i);
                return (
                  <div key={prog.programme_name} className="relative">
                    <Card
                      onClick={() => toggleProgramme(i)}
                      className="cursor-pointer hover:bg-accent transition-colors sticky top-0 z-10 bg-background"
                    >
                      <CardContent className="flex items-center justify-between">
                        <CardTitle>{prog.programme_name}</CardTitle>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-muted-foreground transition-transform duration-200",
                            isExpanded && "rotate-180",
                          )}
                        />
                      </CardContent>
                    </Card>

                    {isExpanded && (
                      <div className="grid gap-3 mt-3">
                        {prog.units.map((unit: UnitPreview) => (
                          <Card key={unit.code} className="p-0">
                            <CardContent className="p-2">
                              <div className="flex justify-between gap-2 items-start mb-2">
                                <div className="flex flex-row gap-2">
                                  <Badge className="bg-foreground text-background px-2">
                                    {unit.code}
                                  </Badge>
                                  <div>{unit.name}</div>
                                </div>

                                <Badge variant="outline">
                                  {unit.teaching_block}
                                </Badge>
                              </div>

                              <div className="flex justify-between items-center pt-2 border-t border-dashed">
                                <span className="text-muted-foreground">
                                  <span className="font-mono">
                                    {unit.credits}CP
                                  </span>{" "}
                                  - {unit.status}
                                </span>
                                <Link
                                  href={unit.link}
                                  target="_blank"
                                  className="font-bold text-blue-600 flex items-center hover:underline"
                                >
                                  Link{" "}
                                  <ExternalLink className="ml-1 w-2.5 h-2.5" />
                                </Link>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

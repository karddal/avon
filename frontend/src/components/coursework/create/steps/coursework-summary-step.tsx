"use client";

import { ArrowLeft, OctagonAlert, Send } from "lucide-react";
import Link from "next/link";
import type {
  UnitData,
  UnitOption,
} from "@/components/coursework/create/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  selectedUnitData: UnitData | null;
  selectedUnitSummary: UnitOption | null;
  name: string;
  description: string;
  dueDate: Date;
  colour: string;
  submitState: boolean;
  showAlert: boolean;
  alertText: string;
  onBack: () => void;
};

export function CourseworkSummaryStep({
  selectedUnitData,
  selectedUnitSummary,
  name,
  description,
  dueDate,
  colour,
  submitState,
  showAlert,
  alertText,
  onBack,
}: Props) {
  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="text-sm font-medium">Summary</CardTitle>
        <CardDescription>
          Here's a summary of the information you've provided.
        </CardDescription>
      </CardHeader>

      <FieldGroup className="flex h-full flex-col content-between">
        <Item variant="muted">
          <ItemContent>
            <ItemTitle>Unit</ItemTitle>
            <ItemDescription>
              {selectedUnitData ? (
                <Link
                  className="text-foreground underline"
                  href={`/units/${selectedUnitData.id}`}
                >
                  <span className="font-mono">
                    {selectedUnitData.unit_code}
                  </span>{" "}
                  {selectedUnitData.name}
                </Link>
              ) : selectedUnitSummary ? (
                <>
                  <span className="font-mono">
                    {selectedUnitSummary.unit_code}
                  </span>{" "}
                  {selectedUnitSummary.name}
                </>
              ) : (
                "Not provided."
              )}
            </ItemDescription>

            <ItemTitle>Coursework name</ItemTitle>
            <ItemDescription>{name || "Not provided."}</ItemDescription>

            <ItemTitle>Coursework description</ItemTitle>
            <ItemDescription>{description || "Not provided."}</ItemDescription>

            <ItemTitle>Due date</ItemTitle>
            <ItemDescription>
              {dueDate ? dueDate.toString() : "Not provided."}
            </ItemDescription>

            <ItemTitle>Colour</ItemTitle>
            <ItemDescription>{colour}</ItemDescription>
            <p
              style={{ backgroundColor: colour }}
              className="size-8 border-2 border-input"
            />
          </ItemContent>
        </Item>

        <ButtonGroup orientation="vertical" className="w-full gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitState}
            onClick={onBack}
          >
            <ArrowLeft />
            Back
          </Button>

          <Button
            type="submit"
            data-cy="create-coursework-submit"
            disabled={submitState}
          >
            {submitState ? <Spinner /> : <Send />}
            Submit
          </Button>
        </ButtonGroup>

        {showAlert && (
          <Alert variant="destructive">
            <OctagonAlert />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{alertText}</AlertDescription>
          </Alert>
        )}
      </FieldGroup>
    </>
  );
}

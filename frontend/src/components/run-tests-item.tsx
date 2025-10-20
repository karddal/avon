"use client";
import { CheckCheckIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Spinner } from "@/components/ui/spinner";

export default function RunTestsItem() {
  const [actionState, setActionState] = useState<number>(0);

  async function clicked() {
    setActionState(1);
    console.log("Started mock api call");
    const delay = new Promise((r) => setTimeout(r, 1000));
    await delay;
    setActionState(2);
    const delay2 = new Promise((r) => setTimeout(r, 500));
    await delay2;
    setActionState(0);
  }
  return (
    <Item variant="outline">
      <ItemMedia variant="icon">
        <CheckCheckIcon />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Run Tests</ItemTitle>
        <ItemDescription>
          Run the tests associated with this coursework.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        {actionState === 1 && (
          <Button size="lg" variant="outline" disabled>
            <Spinner />
            Run tests
          </Button>
        )}
        {actionState === 0 && (
          <Button variant="outline" size="lg" onClick={clicked}>
            Run tests
          </Button>
        )}
        {actionState === 2 && (
          <Button variant="outline" size="lg" disabled>
            <CheckIcon color="var(--color-success)" /> Run tests
          </Button>
        )}
      </ItemActions>
    </Item>
  );
}

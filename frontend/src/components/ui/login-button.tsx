"use client";
import {CheckCheckIcon, CheckIcon, CrossIcon, XIcon} from "lucide-react";
import {Dispatch, SetStateAction, useState} from "react";
import { toast } from "sonner";
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

type LoginButtonData = {
  actionState: number,
  setActionState: Dispatch<SetStateAction<number>>
}

export default function LoginButton({ props }: { props: LoginButtonData }) {
  return (
<div className={"w-full"}>
  {props.actionState === 1 && (
      <Button size="lg" variant="outline" disabled type="submit" className={"w-full"}>
        <Spinner />
        Log in
      </Button>
  )}
  {props.actionState === 0 && (
      <Button variant="outline" size="lg" type="submit" className={"w-full"}>
        Log in
      </Button>
  )}
  {props.actionState === 2 && (
      <Button variant="outline" size="lg" disabled type="submit" className={"w-full"}>
        <XIcon color="oklch(0.6424 0.182 31.15)" /> Log in
      </Button>
  )}
</div>
  );
}

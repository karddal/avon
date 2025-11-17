import { Dot } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "./ui/card";

type UnitData = {
  id: string;
  name: string;
  description?: string;
  creation_date: string;
};

// TODO: Make a more concrete type
type colourMap = {
  [key: string]: string;
};

const colourMap: colourMap = {
  red: "bg-red-400",
  blue: "bg-red-400",
  green: "bg-green-400",
  purple: "bg-purple-400",
  amber: "bg-amber-400",
  teal: "bg-teal-600",
  emerald: "bg-emerald-400",
  fuchsia: "bg-fuchsia-400",
  rose: "bg-rose-700",
};

function getRandomColour(): string {
  const colors = Object.keys(colourMap);
  return colors[Math.floor(Math.random() * colors.length)];
}

export default function Unit({ props }: { props: UnitData }) {
  return (
    <Link href={`/units/${props.id}`}>
      <div className={`${colourMap[getRandomColour()]} h-2`}></div>
      <Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
        <CardContent className="flex flex-row items-center justify-between w-full p-0">
          <div className="flex flex-col w-full">
            <div className="flex flex-col">
              <div className="flex flex-row align-center items-center">
                <p className="text-foreground/80">Unit Code: COMS00000</p>
                <div className={`flex flex-row justify-center items-center`}>
                  <Dot
                    color="#ff0000"
                    size={30}
                    strokeWidth={3}
                    fill="#ff0000"
                  />
                  <p className="-ml-2 text-red-600">Coursework Live</p>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between w-full gap-x-10 lg:text-lg">
                <p className="text-xl">{props.name}</p>
                {/* <p className={`${props.finished ? "" : "hidden"} italic`}>
                  Grade: {props.mark}
                </p> */}
              </div>
            </div>
            <br />
            <div className="flex flex-row gap-4"></div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

import Link from "next/link";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
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

function getRandomTestsPassed(): number {
  return Math.random() * 100;
}

export default function Coursework({ props }: { props: courseworkData }) {
  const randomColor = getRandomColour();
  const testPassed = getRandomTestsPassed();
  return (
    <Link href={`/coursework/${props.id}`}>
      <div className={`${colourMap[randomColor]} w-full h-2`}></div>
      <Card className="bg-muted flex flex-col p-2 hover:bg-foreground/10 ">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-lg lg:text-xl">{props.name}</p>
            <p className="text-muted-foreground">{props.code}</p>
          </div>
          <div className="flex flex-row gap-2">
            <p className="text-sm lg:text-xl text-muted-foreground">
              <span className="text-sm">Due: </span>
              {new Date(props.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <Progress
            value={(testPassed / 100) * 100}
            className="w-3/5 mt-2 opacity-90"
          />
          <p className="text-sm lg:text-l">
            {props.testsPassed}/{props.totalTests} Tests Passed
          </p>
        </div>
      </Card>
    </Link>
  );
}

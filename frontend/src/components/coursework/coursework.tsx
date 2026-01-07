import Link from "next/link";
import { Card } from "../ui/card";

type courseworkData = {
  id: string;
  name: string;
  unit_id?: string;
  description: string;
  colour: string;
  creation_date: string;
  due_date: string;
  unit_code?: string;
};

function _getRandomTestsPassed(): number {
  return Math.random() * 100;
}

export default function Coursework({ props }: { props: courseworkData }) {
  const colouring = {
    backgroundColor: `#${props.colour}`,
  };
  console.log(props);
  return (
    <Link href={`/coursework/${props.id}`}>
      <div style={colouring} className="w-full h-2"></div>
      <Card className="bg-muted flex flex-col p-2 hover:bg-foreground/10 ">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p className="text-lg lg:text-xl">{props.name}</p>
            <p className="text-muted-foreground">{props.unit_code}</p>
          </div>
          <div className="flex flex-row gap-2">
            <p className="text-sm lg:text-xl text-muted-foreground">
              <span className="text-sm">Due: </span>
              {new Date(props.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          {/*<Progress*/}
          {/*  value={(testPassed / 100) * 100}*/}
          {/*  className="w-3/5 mt-2 opacity-90"*/}
          {/*/>*/}
        </div>
      </Card>
    </Link>
  );
}

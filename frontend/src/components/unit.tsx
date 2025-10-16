import Link from "next/link";
import { Card } from "./ui/card";

type unitData = {
	name: string;
	code: string;
	year: number;
	finished: boolean;
	color: string;
	mark: number;
	courseworkLive: boolean;

}

export default function Unit({ props }: { props: unitData }) {

	return (
		<>
			<Link href="/units">
				<div className={`bg-${props.color}-400 w-full h-2`}></div>
				<Card className="bg-muted flex flex-row p-2 h-18 items-center hover:bg-foreground/10">
					<div className="flex flex-row items-center justify-between w-full">
						<div className="flex flex-col">
							<div className="flex flex-col">
								<div className="text-sm">Unit Code: {props.code}</div>
								<div className="text-lg">{props.name}</div>
							</div>
							<br />
							<div className="flex flex-row gap-4">
							</div>
						</div>
					</div>
				</Card>
			</Link>
		</>
	)
}

import Link from "next/link";
import { Card } from "./ui/card";
import { Dot } from "lucide-react";

type unitData = {
	name: string;
	code: string;
	year: string;
	finished: boolean;
	color: string;
	mark: number;
	courseworkLive: boolean;

}

// TODO: Make a more concrete type
type colourMap = {
	[key: string]: string
}

const colourMap: colourMap = {
	"red": "bg-red-400",
	"blue": "bg-red-400",
	"green": "bg-green-400",
	"purple": "bg-purple-400",
	"amber": "bg-amber-400",
	"teal": "bg-teal-600",
	"emerald": "bg-emerald-400",
	"fuchsia": "bg-fuchsia-400",
	"rose": "bg-rose-700"
}

export default function Unit({ props }: { props: unitData }) {

	const liveCoursework = props.courseworkLive ? "" : "hidden"

	return (
		<>
			<Link href="/units">
				<div className={`${colourMap[props.color]} w-full h-2`}></div>
				<Card className="bg-muted flex flex-row p-2 h-18 items-center hover:bg-foreground/10">
					<div className="flex flex-row items-center justify-between w-full">
						<div className="flex flex-col">
							<div className="flex flex-col">
								<div className="flex flex-row text-sm align-center items-center">
									<p>Unit Code: {props.code}</p>
									<div className={`${liveCoursework} flex flex-row justify-center items-center`}>
										<Dot color="#ff0000" size={30} strokeWidth={3} fill="#ff0000" />
										<p className="-ml-2 text-red-600">Coursework Live</p>
									</div>
								</div>
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

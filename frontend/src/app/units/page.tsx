"use client"


import Unit from "@/components/unit";
import YearSelector from "@/components/year-selector";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"

export default function UnitPage() {

	const apiCall = [

		{ name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: true, color: "blue", mark: 0, courseworkLive: false },
		{ name: "Computer Architecure", code: "100015", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science", code: "100014", year: 2025, finished: true, color: "teal", mark: 0, courseworkLive: false },
		{ name: "Object Oriented Programming and Algorithms", code: "100018", year: 2025, finished: false, color: "emerald", mark: 0, courseworkLive: false },
		{ name: "Software Tools", code: "100012", year: 2025, finished: false, color: "rose", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science B", code: "100013", year: 2025, finished: false, color: "purple", mark: 0, courseworkLive: false },
	]
	const ongoing = apiCall.filter(unit => unit.finished === false)
	const ongoingUnits = ongoing.map((unit) => <Unit key={unit.code} props={unit} />)

	const finished = apiCall.filter(unit => unit.finished === true)
	const finishedUnits = finished.map((unit) => <Unit key={unit.code} props={unit} />)
	return (
		<>
			<div className="space-y-6">
				{/* <YearSelector /> */}
				<Tabs defaultValue="ongoing">
					<TabsList className="flex flex-row gap-4 bg-background">
						<YearSelector />
						<div className="bg-accent p-1">
							<TabsTrigger className="bg-accent" value="ongoing">Ongoing</TabsTrigger>
							<TabsTrigger className="bg-accent" value="finished">Finished</TabsTrigger>
						</div>
					</TabsList>
					<TabsContent value="ongoing">
						<section className="grid gap-4 grid-cols-2">
							{ongoingUnits}
						</section>
					</TabsContent>
					<TabsContent value="finished">
						<section className="grid gap-4 grid-cols-2">
							{finishedUnits}
						</section>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}

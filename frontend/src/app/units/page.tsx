"use client"


import Unit from "@/components/unit";
import YearSelector from "@/components/year-selector";

import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import { useState } from "react";

export default function UnitPage() {
	const [isOpen, setIsOpen] = useState(false)

	const apiCall = [

		{ name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: false, color: "blue", mark: 0, courseworkLive: false },
		{ name: "Computer Architecure", code: "100015", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science", code: "100014", year: 2025, finished: false, color: "teal", mark: 0, courseworkLive: false },
		{ name: "Object Oriented Programming and Algorithms", code: "100018", year: 2025, finished: false, color: "emerald", mark: 0, courseworkLive: false },
		{ name: "Software Tools", code: "100012", year: 2025, finished: false, color: "rose", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science B", code: "100013", year: 2025, finished: false, color: "purple", mark: 0, courseworkLive: false },
	]
	const ongoingUnits = apiCall.map((unit) =>

		<Unit key={unit.code} props={unit} />
	)
	const finishedUnits = apiCall.map((unit) => <Unit key={unit.code} props={unit} />)
	return (
		<>
			<div className="space-y-6">
				<YearSelector />
				{/* Ongoing Units */}

				<div>
					<Tabs defaultValue="account">
						<TabsList>
							<TabsTrigger value="ongoing">Ongoing</TabsTrigger>
							<TabsTrigger value="finished">Finished</TabsTrigger>
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
			</div>
		</>
	);
}

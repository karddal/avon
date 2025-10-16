import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Coursework from "@/components/coursework";

export default function courseworkListing() {
    
    const apiCall = [

		{ courseworkId: "112354", name: "List", code: "100016", year: 2025, finished: true, color: "blue", dueDate: "20/9/2025", testsPassed: 50, totalTests: 50},
		{ courseworkId: "347483", name: "Sketch", code: "100016", year: 2025, finished: true, color: "amber", dueDate: "20/12/2025", testsPassed: 58, totalTests: 58},
		{ courseworkId: "566567", name: "Power to the People", code: "100016", year: 2025, finished: false, color: "teal", dueDate: "18/10/2025", testsPassed: 13, totalTests: 68},
		{ courseworkId: "886567", name: "Scotland Yard", code: "100018", year: 2025, finished: false, color: "emerald", dueDate: "16/11/2025", testsPassed: 21, totalTests: 43},
		{ courseworkId: "977557", name: "Simplify", code: "100016", year: 2025, finished: false, color: "rose", dueDate: "5/10/2025", testsPassed: 46, totalTests: 74},
	]
    const ongoing = apiCall.filter(unit => unit.finished === false)
	const ongoingUnits = ongoing.map((unit) => <Coursework key={unit.courseworkId} props={unit} />)

    const finished = apiCall.filter(unit => unit.finished === true)
	const finishedUnits = finished.map((unit) => <Coursework key={unit.courseworkId} props={unit} />)

    return (
        <div className="space-y-6">
			{/* <YearSelector /> */}
			<Tabs defaultValue="ongoing">
				<TabsList className="flex flex-row gap-4 bg-background">
					<div className="bg-accent p-1">
						<TabsTrigger className="bg-accent" value="ongoing">Ongoing</TabsTrigger>
						<TabsTrigger className="bg-accent" value="finished">Finished</TabsTrigger>
					</div>
				</TabsList>
				<TabsContent value="ongoing">
					<section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
						{ongoingUnits}
					</section>
				</TabsContent>
				<TabsContent value="finished">
					<section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
						{finishedUnits}
					</section>
				</TabsContent>
			</Tabs>
        </div>
    );
}

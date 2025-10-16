import Link from "next/link";
import { Card } from "@/components/ui/card";
import Unit from "@/components/unit";
import { finished } from "stream";

export default function UnitPage() {
	const unitData = { name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false }
	const apiCall = [
		{ name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: false, color: "blue", mark: 0, courseworkLive: false },
		{ name: "Computer Architecure", code: "100015", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science", code: "100014", year: 2025, finished: false, color: "teal", mark: 0, courseworkLive: false },
		{ name: "Object Oriented Programming and Algorithms", code: "100018", year: 2025, finished: false, color: "emerald", mark: 0, courseworkLive: false },
		{ name: "Software Tools", code: "100012", year: 2025, finished: false, color: "rose", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science B", code: "100013", year: 2025, finished: false, color: "purple", mark: 0, courseworkLive: false },
	]
	const units = apiCall.map((unit) => <Unit key={unit.code} props={unit} />)
	return (
		<>
			<div className="space-y-6">
				<section className="grid gap-4 grid-cols-2">
					{units}
				</section>
			</div>
		</>
	);
}

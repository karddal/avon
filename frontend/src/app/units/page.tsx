"use client"


import Unit from "@/components/unit";

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";


export default function UnitPage() {
	const apiCall = [
		{ name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: false, color: "blue", mark: 0, courseworkLive: false },
		{ name: "Computer Architecure", code: "100015", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science", code: "100014", year: 2025, finished: false, color: "teal", mark: 0, courseworkLive: false },
		{ name: "Object Oriented Programming and Algorithms", code: "100018", year: 2025, finished: false, color: "emerald", mark: 0, courseworkLive: false },
		{ name: "Software Tools", code: "100012", year: 2025, finished: false, color: "rose", mark: 0, courseworkLive: false },
		{ name: "Mathematics for Computer Science B", code: "100013", year: 2025, finished: false, color: "purple", mark: 0, courseworkLive: false },
	]

	const years = [
		{ value: "2025", label: "2025/2026", },
		{ value: "2024", label: "2024/2025", },
		// { value: "2023", label: "2023/2024", },
		// { value: "2022", label: "2022/2023", },
		// { value: "2021", label: "2021/2022", },
	]
	const units = apiCall.map((unit) => <Unit key={unit.code} props={unit} />)

	const [open, setOpen] = useState(false)
	const [value, setValue] = useState("2025")

	// const years = [{ start: 2025, value: "2025-2026" }, { start: 2024, value: "2024-2025" }, { start: 2023, value: "2023-2024" }]
	return (
		<>
			<div className="space-y-6">
				<div className="flex flex-row">
					<p className="mt-1 mr-1">Year:</p>
					<div className="">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-[200px] justify-between"
								>
									{value
										? years.find((year) => year.value === value)?.label
										: "Select framework..."}
									<ChevronsUpDown className="opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[200px] p-0">
								<Command>
									{/* <CommandInput placeholder="Search framework..." className="h-9" /> */}
									<CommandList>
										{/* <CommandEmpty>No framework found.</CommandEmpty> */}
										<CommandGroup>
											{years.map((years) => (
												<CommandItem
													key={years.value}
													value={years.value}
													onSelect={(currentValue) => {
														setValue(currentValue === value ? "" : currentValue)
														setOpen(false)
													}}
												>
													{years.label}
													<Check
														className={cn(
															"ml-auto",
															value === years.value ? "opacity-100" : "opacity-0"
														)}
													/>
												</CommandItem>
											))}
										</CommandGroup>
									</CommandList>
								</Command>
							</PopoverContent>
						</Popover>
					</div>
				</div>
				<section className="grid gap-4 grid-cols-2">
					{units}
				</section>
			</div>
		</>
	);
}

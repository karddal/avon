import Link from "next/link";
import { Card } from "@/components/ui/card";
import Unit from "@/components/unit";
import { finished } from "stream";

export default function UnitPage() {
	const unitData = { name: "Imperative and Functional Programming", code: "100016", year: 2025, finished: false, color: "amber", mark: 0, courseworkLive: false }
	return (
		<>
			<div className="space-y-6">
				<section className="grid gap-4 grid-cols-2">
					<Unit props={unitData} />
					<Link href="/units">
						<div className="bg-amber-400 w-full h-2"></div>
						<Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
							<div className="flex flex-row items-center justify-between w-full">
								<div className="flex flex-col">
									<p className="text-2xl flex flex-row gap-2 items-center">
										Unit Name
									</p>
									<br />
									<div className="flex flex-row gap-4">
										<p>
											<strong>1</strong> coursework assigned
										</p>
										<p>
											Current Mark: <strong>70%</strong>
										</p>
									</div>
								</div>
							</div>
						</Card>
					</Link>
					<Link href="/units">
						<div className="bg-purple-400 w-full h-2"></div>
						<Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
							<div className="flex flex-row items-center justify-between w-full">
								<div className="flex flex-col">
									<p className="text-2xl flex flex-row gap-2 items-center">
										Unit Name
									</p>
									<br />
									<div className="flex flex-row gap-4">
										<p>
											<strong>1</strong> coursework assigned
										</p>
										<p>
											Current Mark: <strong>70%</strong>
										</p>
									</div>
								</div>
							</div>
						</Card>
					</Link>
					<Link href="/units">
						<div className="bg-red-400 w-full h-2"></div>
						<Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
							<div className="flex flex-row items-center justify-between w-full">
								<div className="flex flex-col">
									<p className="text-2xl flex flex-row gap-2 items-center">
										Unit Name
									</p>
									<br />
									<div className="flex flex-row gap-4">
										<p>
											<strong>1</strong> coursework assigned
										</p>
										<p>
											Current Mark: <strong>70%</strong>
										</p>
									</div>
								</div>
							</div>
						</Card>
					</Link>
					<Link href="/units">
						<div className="bg-blue-400 w-full h-2"></div>
						<Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
							<div className="flex flex-row items-center justify-between w-full">
								<div className="flex flex-col">
									<p className="text-2xl flex flex-row gap-2 items-center">
										Unit Name
									</p>
									<br />
									<div className="flex flex-row gap-4">
										<p>
											<strong>1</strong> coursework assigned
										</p>
										<p>
											Current Mark: <strong>70%</strong>
										</p>
									</div>
								</div>
							</div>
						</Card>
					</Link>
				</section>
			</div>
		</>
	);
}

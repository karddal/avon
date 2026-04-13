"use client";

import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	MailPlus,
	Plus,
	SendHorizontal,
	Trash2,
	Users,
} from "lucide-react";
import { toast } from "sonner";
import UserCard from "@/components/user-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { get_batch_user_info } from "@/lib/actions/auth/get_batch_user_details";
import { get_all_students_with_maybe_repos } from "@/lib/actions/coursework/get_all_students_on_unit_with_repos";
import { delete_invite } from "@/lib/actions/invites/delete_invite";
import { batch_invite_users } from "@/lib/actions/invites/invite_user";
import {
	get_invite_statuses,
	type InviteStatusResult,
} from "@/lib/actions/invites/get_invite_statuses";
import { cn } from "@/lib/utils";

type InviteStudentsProps = {
	open_state: boolean;
	set_open_state: Dispatch<SetStateAction<boolean>>;
	coursework_id: string;
	due_date: string;
};

type StudentInfo = {
	id: string;
	displayName: string;
	src?: string;
	email?: string;
	repo_id?: string | null;
	repo_url?: string | null;
};

type InviteMode = "selected" | "all";
type StudentInviteStatus = "accepted" | "invited" | "not_invited";

function statusBadge(status: StudentInviteStatus) {
	if (status === "accepted") {
		return {
			label: "Accepted",
			icon: CheckCircle2,
			className:
				"border-green-600/30 bg-green-500/10 text-green-700 dark:text-green-400",
		};
	}

	if (status === "invited") {
		return {
			label: "Invited",
			icon: Clock3,
			className:
				"border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400",
		};
	}

	return {
		label: "Not Invited",
		icon: AlertCircle,
		className: "border-red-600/30 bg-red-500/10 text-red-700 dark:text-red-400",
	};
}

export default function InviteStudents({
	open_state,
	set_open_state,
	coursework_id,
	due_date,
}: InviteStudentsProps) {
	const [students, setStudents] = useState<StudentInfo[]>([]);
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [statusByStudentId, setStatusByStudentId] = useState<
		Record<string, StudentInviteStatus>
	>({});
	const [mode, setMode] = useState<InviteMode>("selected");
	const [searchQuery, setSearchQuery] = useState("");
	const [loading, setLoading] = useState(false);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [deletingStudentIds, setDeletingStudentIds] = useState<string[]>([]);
	const inviteExpiryDate = useMemo(() => due_date.slice(0, 10), [due_date]);

	const loadStudents = useCallback(async () => {
		setLoading(true);
		try {
			const studentRepos = await get_all_students_with_maybe_repos({
				coursework_id,
			});
			const studentIds = studentRepos.map((student) => student.id);

			if (studentIds.length === 0) {
				setStudents([]);
				setStatusByStudentId({});
				return;
			}

			const enrichedStudents = await get_batch_user_info(studentIds);
			const usersById = new Map(
				enrichedStudents.map((student) => [student.id, student]),
			);

			const mergedStudents = studentRepos.map((student) => {
				const user = usersById.get(student.id);
				return {
					id: student.id,
					displayName: user?.displayName ?? student.name,
					src: user?.src,
					email: user?.email,
					repo_id: student.repo_id,
					repo_url: student.repo_url,
				};
			});

			setStudents(mergedStudents);

			const statusTargets = mergedStudents
				.filter((student) => student.email && student.repo_id)
				.map((student) => ({
					project_id: student.repo_id as string,
					user_email: student.email as string,
				}));

			if (statusTargets.length === 0) {
				setStatusByStudentId({});
				return;
			}

			const statusResponse = await get_invite_statuses(statusTargets);
			const statusMap = new Map<string, InviteStatusResult>(
				statusResponse.data.map((result) => [
					`${result.project_id}:${result.user_email.toLowerCase()}`,
					result,
				]),
			);

			const nextStatuses: Record<string, StudentInviteStatus> = {};
			for (const student of mergedStudents) {
				if (!student.email || !student.repo_id) {
					nextStatuses[student.id] = "not_invited";
					continue;
				}

				const key = `${student.repo_id}:${student.email.toLowerCase()}`;
				nextStatuses[student.id] = statusMap.get(key)?.status ?? "not_invited";
			}
			setStatusByStudentId(nextStatuses);
		} catch {
			setStudents([]);
			setStatusByStudentId({});
		} finally {
			setLoading(false);
		}
	}, [coursework_id]);

	useEffect(() => {
		if (!open_state) {
			return;
		}

		setSelectedStudentIds([]);
		setMode("selected");
		void loadStudents();
	}, [open_state, loadStudents]);

	const filteredStudents = useMemo(() => {
		const normalizedQuery = searchQuery.toLowerCase();

		return students.filter((student) => {
			return (
				student.displayName.toLowerCase().includes(normalizedQuery) ||
				student.email?.toLowerCase().includes(normalizedQuery)
			);
		});
	}, [students, searchQuery]);

	const selectableStudentIds = useMemo(() => {
		return filteredStudents
			.filter(
				(student) =>
					Boolean(student.email) &&
					Boolean(student.repo_id) &&
					statusByStudentId[student.id] === "not_invited",
			)
			.map((student) => student.id);
	}, [filteredStudents, statusByStudentId]);

	const inviteAllStudentIds = useMemo(() => {
		return students
			.filter(
				(student) =>
					Boolean(student.email) &&
					Boolean(student.repo_id) &&
					statusByStudentId[student.id] === "not_invited",
			)
			.map((student) => student.id);
	}, [students, statusByStudentId]);

	const selectedInviteableIds =
		mode === "all" ? inviteAllStudentIds : selectedStudentIds;

	const inviteCount = students.filter(
		(student) =>
			selectedInviteableIds.includes(student.id) &&
			Boolean(student.email) &&
			Boolean(student.repo_id) &&
			statusByStudentId[student.id] === "not_invited",
	).length;

	async function handleInviteStudents() {
		const selectedStudents = students.filter((student) =>
			selectedInviteableIds.includes(student.id),
		);
		const invitesByProject = new Map<string, string[]>();

		for (const student of selectedStudents) {
			if (
				!student.email ||
				!student.repo_id ||
				statusByStudentId[student.id] !== "not_invited"
			) {
				continue;
			}

			const existingEmails = invitesByProject.get(student.repo_id) ?? [];
			invitesByProject.set(student.repo_id, [...existingEmails, student.email]);
		}

		if (inviteCount === 0) {
			return;
		}

		setSubmitLoading(true);
		try {
			const results = await Promise.all(
				Array.from(invitesByProject.entries()).map(
					([project_id, user_emails]) =>
						batch_invite_users(project_id, user_emails, 30, inviteExpiryDate),
				),
			);

			if (results.every((result) => result.success)) {
				toast.success("Student invitations sent");
				setSelectedStudentIds([]);
				await loadStudents();
				return;
			}

			toast.error("Failed to send student invitations");
		} catch {
			toast.error("Failed to send student invitations");
		} finally {
			setSubmitLoading(false);
		}
	}

	async function handleDeleteInvite(student: StudentInfo) {
		if (!student.email || !student.repo_id) {
			return;
		}

		setDeletingStudentIds((current) => [...current, student.id]);
		try {
			const result = await delete_invite(student.repo_id, student.email);
			if (!result.success) {
				toast.error("Failed to delete student invitation");
				return;
			}

			setSelectedStudentIds((current) =>
				current.filter((selectedStudentId) => selectedStudentId !== student.id),
			);
			toast.success("Student invitation deleted");
			await loadStudents();
		} catch {
			toast.error("Failed to delete student invitation");
		} finally {
			setDeletingStudentIds((current) =>
				current.filter((studentId) => studentId !== student.id),
			);
		}
	}

	return (
		<Dialog open={open_state} onOpenChange={set_open_state}>
			<DialogContent className="max-w-[90%]! xl:max-w-[70%]! w-full max-h-full! lg:max-h-[78vh]! overflow-y-auto p-0">
				<div className="flex flex-col gap-6 w-full justify-center items-stretch">
					<div className="lg:max-h-[80vh]! flex-2 lg:overflow-y-auto bg-background border rounded-xl justify-between flex flex-col">
						<div className="p-8 pb-0">
							<DialogTitle className="text-xl">Invite Students</DialogTitle>
							<p className="text-sm text-muted-foreground mb-6">
								Invite enrolled students to their coursework repositories and
								track invitation progress.
							</p>
						</div>

						<div className="p-8 pt-0 flex flex-col gap-4">
							<div className="grid gap-3 md:grid-cols-2">
								<button
									type="button"
									onClick={() => setMode("selected")}
									className={cn(
										"rounded-md border p-4 text-left transition-colors",
										mode === "selected"
											? "border-foreground bg-accent"
											: "border-border",
									)}
								>
									<div className="font-medium">Select students</div>
									<div className="text-sm text-muted-foreground mt-1">
										Choose specific students whose repos should receive an
										invitation.
									</div>
								</button>

								<button
									type="button"
									onClick={() => setMode("all")}
									className={cn(
										"rounded-md border p-4 text-left transition-colors",
										mode === "all"
											? "border-foreground bg-accent"
											: "border-border",
									)}
								>
									<div className="font-medium">All students</div>
									<div className="text-sm text-muted-foreground mt-1">
										Send invitations to every student with a repo who has not
										already accepted or been invited.
									</div>
								</button>
							</div>

							<Input
								placeholder="Search students by name or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>

							<div className="flex items-center justify-between text-sm text-muted-foreground">
								<span>
									{mode === "all"
										? `${inviteAllStudentIds.length} students are eligible for invites.`
										: `${selectedStudentIds.length} students selected`}
								</span>
								<span>{filteredStudents.length} shown</span>
							</div>

							{searchQuery.length > 0 ? (
								<div className="flex max-h-72 flex-col gap-2 overflow-y-auto rounded-md border bg-accent p-2">
									{loading ? (
										<div className="flex items-center justify-center py-8">
											<Spinner className="mr-2 h-4 w-4" />
										</div>
									) : filteredStudents.length > 0 ? (
										filteredStudents.map((student) => {
											const email = student.email;
											const hasRepo = Boolean(student.repo_id);
											const status =
												statusByStudentId[student.id] ?? "not_invited";
											const badge = statusBadge(status);
											const Icon = badge.icon;
											const isSelected = selectedStudentIds.includes(
												student.id,
											);
											const isDeleting = deletingStudentIds.includes(
												student.id,
											);
											const canSelect =
												Boolean(email) && hasRepo && status === "not_invited";

											return (
												<div className="group relative w-full" key={student.id}>
													<UserCard
														id={student.id}
														name={student.displayName}
														image={student.src}
														email={student.email}
														user_role={false}
													/>
													<div className="mt-2 flex flex-wrap items-center gap-2 px-1">
														<Badge className={badge.className}>
															<Icon />
															{badge.label}
														</Badge>
														{!hasRepo && (
															<Badge variant="outline">
																No repo provisioned
															</Badge>
														)}
													{status === "invited" && (
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => void handleDeleteInvite(student)}
															disabled={isDeleting || submitLoading}
															className="h-6 px-2 text-xs"
														>
															{isDeleting ? (
																<Spinner className="mr-1 h-3 w-3" />
															) : (
																<Trash2 className="mr-1 h-3 w-3" />
															)}
															Delete invite
														</Button>
													)}
													</div>
													{mode === "selected" && (
														<div className="absolute top-2 right-2 w-8 h-8">
															<Checkbox
																disabled={
																	!canSelect || submitLoading || isDeleting
																}
																checked={isSelected}
																onCheckedChange={(checked) => {
																	if (!canSelect) {
																		return;
																	}

																	if (!checked) {
																		setSelectedStudentIds((current) =>
																			current.filter(
																				(selectedStudentId) =>
																					selectedStudentId !== student.id,
																			),
																		);
																		return;
																	}

																	setSelectedStudentIds((current) => [
																		...current,
																		student.id,
																	]);
																}}
																className="peer w-full h-full z-10 bg-card/80 shadow rounded-none border data-[state=checked]:bg-primary"
															/>
															<div
																className="
																absolute inset-0 flex items-center justify-center
																pointer-events-none
																transition-all
																duration-400
																ease-in-out
																peer-data-[state=checked]:opacity-0
																peer-data-[state=checked]:scale-0
																peer-data-[state=checked]:rotate-90
															"
															>
																<Plus
																	size={20}
																	className="text-muted-foreground"
																/>
															</div>
														</div>
													)}
												</div>
											);
										})
									) : (
										<div className="text-center py-10 text-muted-foreground text-sm">
											No students found.
										</div>
									)}
								</div>
							) : null}

							<Button
								className="w-full"
								onClick={handleInviteStudents}
								disabled={inviteCount === 0 || submitLoading}
							>
								{submitLoading ? (
									<>
										<Spinner className="mr-2 h-4 w-4" />
										Sending invitations...
									</>
								) : (
									<>
										<SendHorizontal className="mr-2 h-4 w-4" />
										{mode === "all"
											? "Invite All Eligible Students"
											: "Invite Selected Students"}
										{inviteCount > 0 ? ` (${inviteCount})` : ""}
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

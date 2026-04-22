import {
	flexRender,
	getExpandedRowModel,
	getGroupedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type PaginationState,
	type SortingState,
	type VisibilityState,
} from "@tanstack/table-core";
import { ChevronDown, ChevronRight, SendHorizontal } from "lucide-react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import {
	columns,
	type StudentInviteStatus,
	type StudentNameAndPotentiallyRepo,
} from "@/components/coursework/student-list/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { get_batch_user_info } from "@/lib/actions/auth/get_batch_user_details";
import { get_all_students_with_maybe_repos } from "@/lib/actions/coursework/get_all_students_on_unit_with_repos";
import { delete_invite } from "@/lib/actions/invites/delete_invite";
import { get_invite_statuses } from "@/lib/actions/invites/get_invite_statuses";
import { batch_invite_users } from "@/lib/actions/invites/invite_user";
import { cn } from "@/lib/utils";

type InviteMode = "selected" | "all";

export function StudentsTableWithMaybeRepos({
	coursework_id,
	due_date,
	refresh,
}: {
	coursework_id: string;
	due_date: string;
	refresh: () => void;
}) {
	const [data, setData] = useState<StudentNameAndPotentiallyRepo[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitLoading, setSubmitLoading] = useState(false);
	const [invitingStudentIds, setInvitingStudentIds] = useState<string[]>([]);
	const [deletingStudentIds, setDeletingStudentIds] = useState<string[]>([]);
	const [mode, setMode] = useState<InviteMode>("selected");
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[],
	);
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = React.useState({});
	const [pagination, setPagination] = React.useState<PaginationState>({
		pageIndex: 0,
		pageSize: 5,
	});
	const inviteStatusRequestRef = useRef(0);
	const inviteExpiryDate = useMemo(
		() => (due_date ? due_date.slice(0, 10) : undefined),
		[due_date],
	);

	const refreshStudentsInviteStatuses = useCallback(
		async (
			students: StudentNameAndPotentiallyRepo[],
			options?: {
				requestId?: number;
				suppressErrorToast?: boolean;
			},
		) => {
			const targets = students
				.filter((student) => student.repo_id && student.email)
				.map((student) => ({
					project_id: student.repo_id as string,
					user_email: student.email as string,
				}));

			if (targets.length === 0) {
				return;
			}

			try {
				const statusResponse = await get_invite_statuses(targets);
				const statusMap = new Map(
					statusResponse.data.map((result) => [
						`${result.project_id}:${result.user_email.toLowerCase()}`,
						result.status,
					]),
				);
				const studentIds = new Set(students.map(({ id }) => id));
				const studentsById = new Map(
					students.map((student) => [student.id, student]),
				);

				setData((current) => {
					if (
						options?.requestId !== undefined &&
						options.requestId !== inviteStatusRequestRef.current
					) {
						return current;
					}

					return current.map((row) => {
						if (!studentIds.has(row.id)) {
							return row;
						}

						const student = studentsById.get(row.id);
						if (!student?.repo_id || !student.email) {
							return row;
						}

						const key = `${student.repo_id}:${student.email.toLowerCase()}`;
						return {
							...row,
							invite_status:
								statusMap.get(key) ?? ("not_invited" as StudentInviteStatus),
						};
					});
				});
			} catch {
				if (!options?.suppressErrorToast) {
					toast.error("Failed to refresh student invitation status");
				}
			}
		},
		[],
	);

	const loadData = useCallback(async () => {
		setLoading(true);
		try {
			const studentRepos = await get_all_students_with_maybe_repos({
				coursework_id,
			});
			const studentIds = studentRepos.map((student) => student.id);

			if (studentIds.length === 0) {
				setData([]);
				return;
			}

			const enrichedStudents = await get_batch_user_info(studentIds);
			const usersById = new Map(
				enrichedStudents.map((student) => [student.id, student]),
			);

			const mergedStudents: StudentNameAndPotentiallyRepo[] = studentRepos.map(
				(student) => {
					const user = usersById.get(student.id);
					const hasInviteLookup =
						Boolean(user?.email) && Boolean(student.repo_id);
					return {
						...student,
						name: user?.displayName ?? student.name,
						src: user?.src,
						email: user?.email,
						invite_status: hasInviteLookup ? "loading" : "not_invited",
					};
				},
			);
			setData(mergedStudents);
			setLoading(false);

			const requestId = inviteStatusRequestRef.current + 1;
			inviteStatusRequestRef.current = requestId;
			void refreshStudentsInviteStatuses(mergedStudents, {
				requestId,
				suppressErrorToast: true,
			});
		} catch {
			setData([]);
			toast.error("Failed to load student repositories");
		} finally {
			setLoading(false);
		}
	}, [coursework_id, refreshStudentsInviteStatuses]);

	const eligibleStudentIds = useMemo(
		() =>
			data
				.filter(
					(student) =>
						Boolean(student.email) &&
						Boolean(student.repo_id) &&
						student.invite_status === "not_invited",
				)
				.map((student) => student.id),
		[data],
	);

	const selectedStudentIds = useMemo(
		() =>
			Object.keys(rowSelection).filter((id) =>
				data.some((row) => row.id === id),
			),
		[data, rowSelection],
	);

	const selectedInviteableIds = useMemo(
		() => (mode === "all" ? eligibleStudentIds : selectedStudentIds),
		[eligibleStudentIds, mode, selectedStudentIds],
	);

	const inviteCount = useMemo(
		() =>
			data.filter(
				(student) =>
					selectedInviteableIds.includes(student.id) &&
					Boolean(student.email) &&
					Boolean(student.repo_id) &&
					student.invite_status === "not_invited",
			).length,
		[data, selectedInviteableIds],
	);

	async function inviteStudents(studentIds: string[]) {
		const selectedStudents = data.filter((student) =>
			studentIds.includes(student.id),
		);
		const invitesByProject = new Map<string, string[]>();

		for (const student of selectedStudents) {
			if (
				!student.email ||
				!student.repo_id ||
				student.invite_status !== "not_invited"
			) {
				continue;
			}

			const existingEmails = invitesByProject.get(student.repo_id) ?? [];
			invitesByProject.set(student.repo_id, [...existingEmails, student.email]);
		}

		if (invitesByProject.size === 0) {
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
				setRowSelection({});
				await loadData();
				refresh();
				return;
			}

			toast.error("Failed to send student invitations");
		} catch {
			toast.error("Failed to send student invitations");
		} finally {
			setSubmitLoading(false);
		}
	}

	async function handleInviteStudents() {
		await inviteStudents(selectedInviteableIds);
	}

	const handleInviteStudentsByList = useCallback(
		async (students: StudentNameAndPotentiallyRepo[]) => {
			const inviteTargets = students.filter(
				(student) =>
					student.repo_id &&
					student.email &&
					student.invite_status === "not_invited",
			);

			if (inviteTargets.length === 0) {
				return;
			}

			setInvitingStudentIds((current) => [
				...current,
				...inviteTargets.map((student) => student.id),
			]);
			try {
				const invitesByProject = new Map<string, string[]>();
				for (const student of inviteTargets) {
					const existingEmails =
						invitesByProject.get(student.repo_id as string) ?? [];
					invitesByProject.set(student.repo_id as string, [
						...existingEmails,
						student.email as string,
					]);
				}

				const results = await Promise.all(
					Array.from(invitesByProject.entries()).map(
						([project_id, user_emails]) =>
							batch_invite_users(project_id, user_emails, 30, inviteExpiryDate),
					),
				);

				if (!results.every((result) => result.success)) {
					toast.error("Failed to send student invitations");
					return;
				}

				toast.success(
					inviteTargets.length === 1
						? "Student invitation sent"
						: "Team invitations sent",
				);
				await refreshStudentsInviteStatuses(inviteTargets);
			} catch {
				toast.error("Failed to send student invitations");
			} finally {
				setInvitingStudentIds((current) =>
					current.filter(
						(studentId) =>
							!inviteTargets.some((student) => student.id === studentId),
					),
				);
			}
		},
		[inviteExpiryDate, refreshStudentsInviteStatuses],
	);

	const handleDeleteInvitesByList = useCallback(
		async (students: StudentNameAndPotentiallyRepo[]) => {
			const deleteTargets = students.filter(
				(student) =>
					student.repo_id &&
					student.email &&
					student.invite_status === "invited",
			);

			if (deleteTargets.length === 0) {
				return;
			}

			setDeletingStudentIds((current) => [
				...current,
				...deleteTargets.map((student) => student.id),
			]);
			try {
				const results = await Promise.all(
					deleteTargets.map((student) =>
						delete_invite(student.repo_id as string, student.email as string),
					),
				);
				if (!results.every((result) => result.success)) {
					toast.error("Failed to delete student invitations");
					return;
				}

				toast.success(
					deleteTargets.length === 1
						? "Student invitation deleted"
						: "Team invitations deleted",
				);
				await refreshStudentsInviteStatuses(deleteTargets);
			} catch {
				toast.error("Failed to delete student invitations");
			} finally {
				setDeletingStudentIds((current) =>
					current.filter(
						(studentId) =>
							!deleteTargets.some((student) => student.id === studentId),
					),
				);
			}
		},
		[refreshStudentsInviteStatuses],
	);

	const tableColumns = useMemo(
		() =>
			columns({
				cw_id: coursework_id,
				refresh,
				reloadData: loadData,
				onInviteStudents: handleInviteStudentsByList,
				onDeleteInvites: handleDeleteInvitesByList,
				submitLoading,
				invitingStudentIds,
				deletingStudentIds,
			}),
		[
			coursework_id,
			refresh,
			loadData,
			handleInviteStudentsByList,
			handleDeleteInvitesByList,
			submitLoading,
			invitingStudentIds,
			deletingStudentIds,
		],
	);

	const table = useReactTable({
		data,
		columns: tableColumns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getGroupedRowModel: getGroupedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		getRowId: (row) => row.id,
		paginateExpandedRows: false,
		autoResetExpanded: false,
		autoResetPageIndex: false,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
		},
	});

	useEffect(() => {
		table.setGrouping(["repo_url"]);
	}, [table]);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	if (loading) {
		return (
			<div className="flex w-full items-center justify-center">
				<Spinner className="h-10 w-10" />
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="flex flex-col gap-4 py-4">
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
						<div className="font-medium">Selected students</div>
						<div className="mt-1 text-sm text-muted-foreground">
							Use the table selection to preview inviting specific students.
						</div>
					</button>
					<button
						type="button"
						onClick={() => setMode("all")}
						className={cn(
							"rounded-md border p-4 text-left transition-colors",
							mode === "all" ? "border-foreground bg-accent" : "border-border",
						)}
					>
						<div className="font-medium">All eligible students</div>
						<div className="mt-1 text-sm text-muted-foreground">
							Invite everyone with a repo who has not already been invited.
						</div>
					</button>
				</div>

				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<Input
						placeholder="Filter students by name..."
						value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
						onChange={(event) =>
							table.getColumn("name")?.setFilterValue(event.target.value)
						}
						className="lg:max-w-sm"
					/>
					<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
						<span className="text-sm text-muted-foreground">
							{mode === "all"
								? `${eligibleStudentIds.length} students are eligible for invites.`
								: `${inviteCount} invites will be sent to the selected students.`}
						</span>
						<Button
							onClick={() => void handleInviteStudents()}
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
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="overflow-auto rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										className={cn(
											header.column.id === "actions" && "w-12 text-right",
										)}
									>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>

					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => {
								const isGroupedRow = row.getIsGrouped();
								const isExpandedGroup = isGroupedRow && row.getIsExpanded();
								const isSubRow = row.depth > 0;

								return (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className={cn(
											isExpandedGroup &&
												"bg-zinc-200 text-zinc-950 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600",
											isSubRow &&
												"bg-zinc-100/90 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
										)}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell
												key={cell.id}
												className={cn(
													isExpandedGroup && "font-medium",
													cell.column.id === "select" && "w-10",
													cell.column.id === "actions" && "w-12 text-right",
													isSubRow && "border-zinc-300/70 dark:border-zinc-600",
													isSubRow && cell.column.id !== "select" && "pl-6",
												)}
											>
												{cell.getIsGrouped() ? (
													<button
														type="button"
														className="flex flex-row items-center gap-2"
														onClick={row.getToggleExpandedHandler()}
														style={{
															cursor: row.getCanExpand() ? "pointer" : "normal",
														}}
													>
														{row.getIsExpanded() ? (
															<ChevronDown className="h-4 w-4" />
														) : (
															<ChevronRight className="h-4 w-4" />
														)}
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
														({row.subRows.length})
													</button>
												) : (
													flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)
												)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={table.getVisibleLeafColumns().length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-end space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					{table.getFilteredSelectedRowModel().rows.length} of{" "}
					{table.getFilteredRowModel().rows.length} student(s) or group(s)
					selected.
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Previous
					</Button>
					<span className="text-sm text-muted-foreground">
						{table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}

export function buildDefaultDueDate() {
    const now = new Date();
    return new Date(new Date(now).setHours(now.getHours() + 25))
}

export function toDataCyValue(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function validateDueDateAgainstUnitEnd(dueDate: Date, unitEndDate?: string) {
    if (!unitEndDate) return null;

    const endDate = new Date(unitEndDate);

    if (dueDate >= endDate) {
        return `Due date cannot be after the unit ends (${endDate.toLocaleString()}).`;
    }

    return null
}

export function getStepProgress(step: string) {
    if (step === "details") return 0;
    if (step === "colour") return 50;
    if (step === "summary") return 100;
    return 0;
}
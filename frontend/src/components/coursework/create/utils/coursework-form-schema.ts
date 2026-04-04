import zod from "zod";

export function createCourseworkSchema(today: Date) {
    return zod.object({
        unit_id: zod.uuid({ message: "Please choose a valid unit." }),
        name: zod.string().min(2, { message: "Name must be at least 2 characters." }),
        description: zod.string().min(2, {message: "Description must be at least 2 characters."}),
        color: zod.string(),
        due_date: zod.date().min(today, {message: "Due date must be in the future."}),
    })
}

export type CourseworkFormValues = zod.infer<ReturnType<typeof createCourseworkSchema>>
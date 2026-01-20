import {getRequestJWT} from "@/lib/auth-utils";

type UnitData = {
    id: string;
    name: string;
    description?: string;
    creation_date: string;
    unit_code: string;
};

export default async function UnitName({
                                           slug,
                                       }: {
    slug: Promise<{ slug: string }>;
}) {
    const token = await getRequestJWT();
    const s = await slug;
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/units/${s.slug}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-cache",
        },
    );

    const unit: UnitData = await response.json();

    return (
        <>

        </>
    );
}

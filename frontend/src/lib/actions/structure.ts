"use server";

export interface UnitPreview {
  name: string;
  code: string;
  credits: number;
  teaching_block: string;
  status: string;
  link: string;
}

export interface ProgrammePreview {
  programme_name: string;
  start_year: number;
  end_year: number;
  units: UnitPreview[];
}

export interface StructurePreviewResponse {
  results: ProgrammePreview[];
}

export async function getStructurePreview(link: string, years: string[]) {
  const yearNumbers = years.map((y) => parseInt(y.replace("Year ", "")));

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/structure/preview`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: link,
          years: yearNumbers,
        }),
      },
    );

    if (!response.ok) throw new Error("Failed to fetch structure");

    const data: StructurePreviewResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Scraper Error:", error);
    return null;
  }
}

export async function sendStructure(payload: StructurePreviewResponse) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/structure/create`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) throw new Error("Failed to create structure");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

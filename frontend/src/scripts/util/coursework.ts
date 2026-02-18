"use server";

type CreateCourseworkRequest = {
  name: string;
  description: string;
  unit_id: string;
  due_date: string;
  colour: string;
};

export async function create_coursework(req: CreateCourseworkRequest) {
  "use server";
  const data = await fetch(`http://localhost:8000/coursework/create`, {
    method: "POST",
    cache: "no-cache",
    body: JSON.stringify(req),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!data.ok) {
    const json = await data.json();
    return {
      success: false,
      data: json,
    };
  } else {
    const json = await data.json();
    return {
      success: true,
      data: json,
    };
  }
}

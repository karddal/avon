"use server";

type createUnitReq = {
  name: string;
  description: string;
  unit_code: string;
  colour: string;
  programme_id: string;
  unlocked: boolean | null;
};

export async function create_unit(req: createUnitReq) {
  "use server";
  console.log(req);
  const r = await fetch(`http://localhost:8000/units/create`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(req),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!r.ok) {
    const json = await r.json();
    return {
      success: false,
      data: json,
    };
  } else {
    const json = await r.json();
    return {
      success: true,
      data: json,
    };
  }
}

"use server";

type createUnitReq = {
  name: string;
  description: string;
  unit_code: string;
  colour: string;
  programme_id: string;
};

export async function create_unit(req: createUnitReq) {
  "use server";
  console.log(req);
  const r = await fetch(
    `
        ${process.env.NEXT_PUBLIC_API_URL}/units/create`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req),
    },
  );

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

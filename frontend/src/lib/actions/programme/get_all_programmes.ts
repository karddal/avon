"use server";

export async function getProgrammes() {
  "use server";
  //   const token = await getRequestJWT();
  const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/programmes/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  // const data = await r.json();
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

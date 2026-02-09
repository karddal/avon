"use server";

type CreateProgrammeRequest = {
  name: string;
  start_date: string;
  end_date: string;
  // gitlab_id: string;
};

type _CreateProgrammeResponse = {
  success: boolean;
  //data: any;
};

export async function create_programme(req: CreateProgrammeRequest) {
  "use server";
  console.log(req);
  const data = await fetch(`http://localhost:8000/programmes/create`, {
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

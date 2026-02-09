"use server";
import { getRequestJWT } from "@/lib/auth-utils";

type TransferUnitMembersRequest = {
  unitIdFrom: string;  
  unitIdsTo: string[];
  omittedMembers: string[];
};

type TransferUnitMembersResponse = {
  success: boolean;
};
// Cannot delete lecturers from a unit, only students
export async function transfer_unit_members(req: TransferUnitMembersRequest) {
  "use server";
  const token = await getRequestJWT();
  console.log("current request");
  console.log(req);

//   const data = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/programmes/create`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       cache: "no-cache",
//       body: JSON.stringify(req),
//     },
//   );
//   if (!data.ok) {
//     const json = await data.json();
//     return {
//       success: false,
//       data: json,
//     };
//   } else {
//     const json = await data.json();
//     return {
//       success: true,
//       data: json,
//     };
//   }
}

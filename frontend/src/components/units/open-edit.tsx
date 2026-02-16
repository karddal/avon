"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import EditUnit from "@/components/units/edit-unit";

type UnitUpdateData = {
  id: string;
  name: string;
  description?: string;
  colour: string;
  unit_code: string;
  programme_id: string;
};

export default function OpenEdit({ data }: { data: UnitUpdateData }) {
  const params = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (params.get("edit") === "1") {
      setOpen(true);

      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      router.replace(
        url.pathname + (url.search ? `?${url.searchParams.toString()}` : ""),
        { scroll: false },
      );
    }
  }, [params, router]);

  return (
    <EditUnit
      unit_update_data={data}
      open_state={open}
      set_open_state={setOpen}
    />
  );
}

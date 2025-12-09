"use client";
import { SearchableSelect } from "@/components/searchableSelect";

export interface AnalyticsToolbarProps {
  //the filters used in toolbar
  filters: {
    academicYear?: string;
    teachingBlock?: "TB1" | "TB2" | "TB4";
    unitName?: string;
    courseworkName?: string;
    sort?: "firstNameAlphabetical" | "familyNameAlphabetical" | "score";
  };
}

export function AnalyticsToolbar() {
  // const [value, setValue] = useState<string | undefined>()
  const options = [{ value: "A" }, { value: "B" }, { value: "C" }];

  const yearOfStudyOptions = [
    { value: "UG1" },
    { value: "UG2" },
    { value: "UG3" },
    { value: "M1" },
    { value: "PhD1" },
    { value: "PhD2" },
    { value: "PhD3" },
  ];

  const _teachingBlock = [{ value: "TB1" }, { value: "TB2" }, { value: "TB4" }];

  return (
    <div className="flex gap-2 border p-2 flex-wrap">
      {/*<div className="text-sm text-gray-500">*/}
      {/*    CurrentValue: {value ?? "unselected"}*/}
      {/*</div>*/}
      <SearchableSelect prefix={"Academic Year"} options={yearOfStudyOptions} />
      <SearchableSelect prefix={"Faculty"} options={options} />
      <SearchableSelect prefix={"Course"} options={options} />
    </div>
  );
}

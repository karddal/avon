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

  const teachingBlock = [{ value: "TB1" }, { value: "TB2" }, { value: "TB4" }];

  return (
    <div className="w-full overflow-x-auto lg:overflow-x-visible">
      <div className="flex w-max gap-2 border p-2 lg:w-full lg:flex-wrap">
        <SearchableSelect
          prefix={"academicYear"}
          options={options} /*value={value} onChange={setValue}*/
        />
        {/*<div className="text-sm text-gray-500">*/}
        {/*    CurrentValue: {value ?? "unselected"}*/}
        {/*</div>*/}
        <SearchableSelect
          prefix={"Year of Study"}
          options={yearOfStudyOptions}
        />
        <SearchableSelect prefix={"teachingBlock"} options={teachingBlock} />
        <SearchableSelect prefix={"Faculty"} options={options} />
        <SearchableSelect prefix={"course"} options={options} />
        <SearchableSelect prefix={"teachingBlock"} options={options} />
      </div>
    </div>
  );
}

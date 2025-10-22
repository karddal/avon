'use client'
import {useState} from "react";
import {SearchableSelect} from "@/components/searchableSelect"

export interface AnalyticsToolbarProps {
    //the filters used in toolbar
    filters: {
        academicYear?: string;
        teachingBlock?: 'TB1' | 'TB2' | 'TB4';
        unitName?: string;
        courseworkName?: string;
        sort?: 'firstNameAlphabetical' | 'familyNameAlphabetical' | 'score';
    }
}

export function AnalyticsToolbar() {
    // const [value, setValue] = useState<string | undefined>()
    const options = [
        { value: 'A' },
        { value: 'B' },
        { value: 'C' },
    ]

    return (
        <div className="flex flex-col lg:flex-row gap-4 border">
            <SearchableSelect prefix={"academicYear"} options={options} /*value={value} onChange={setValue}*/ />
            {/*<div className="text-sm text-gray-500">*/}
            {/*    CurrentValue: {value ?? "unselected"}*/}
            {/*</div>*/}
        </div>
    )
}
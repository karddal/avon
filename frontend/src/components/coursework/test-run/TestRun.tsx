import React, {useEffect, useState} from "react";
import {fetch_test_runs} from "@/lib/actions/coursework/coursework-fetch-test-runs";
import {get_test_run_for_cw, TestRunFullDetails} from "@/lib/actions/test_run/cw-get-specific-test-run";
import {Spinner} from "@/components/ui/spinner";

export default function TestRunComponent({test_run_id, coursework_id}:{test_run_id: string; coursework_id: string}) {
    const [data, setData] = useState<TestRunFullDetails>();
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        setLoading(true);
        const updateData = async () => {
            // TODO: GET DATA HERE
            const updatedData = await get_test_run_for_cw({run_id: test_run_id, cw_id: coursework_id});
            setData(updatedData);
            console.log(updatedData);
        };
        updateData().then(() => {
            setLoading(false);
        });
    }, [coursework_id, test_run_id])

    if (loading) {
        return (
            <div className={"w-full flex items-center justify-center"}>
                <Spinner className={"w-10 h-10"} />
            </div>
        );
    }

    return (
        <div className={"w-full flex items-center justify-center"}>

        </div>
    )
}
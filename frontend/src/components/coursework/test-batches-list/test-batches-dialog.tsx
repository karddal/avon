"use client";

import { type Dispatch, type SetStateAction, Suspense } from "react";
import { StudentsTableWithMaybeRepos } from "@/components/coursework/student-list/studs-table";
import { CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {TestBatchesTable} from "@/components/coursework/test-batches-list/test-batches-table";

type Props = {
  open_state: boolean;
  set_open_state: Dispatch<SetStateAction<boolean>>;
  courseworkId: string;
  refresh: () => void;
};

export default function TestBatchesDialog({
  open_state,
  set_open_state,
  courseworkId,
    refresh,
}: Props) {
  return (
    <Dialog open={open_state} onOpenChange={set_open_state}>
      <DialogContent className="overscroll-none h-[90vh] xs:h-screen max-w-full! lg:max-w-[80%]! w-full overflow-y-scroll p-0 border-none bg-transparent shadow-none">
        <div className="w-full h-full min-w-0 bg-background border shadow-lg overscroll-none overflow-y-scroll">
            <div className="flex flex-col p-8 h-full overscroll-none">
              <DialogTitle className="text-xl">View test batches</DialogTitle>
              <p className="text-sm text-muted-foreground mb-6">
                This table lists all test test batches for this coursework.
              </p>
              <CardTitle>Test batches</CardTitle>
              <Suspense>
                <TestBatchesTable coursework_id={courseworkId} refreshTable={refresh}></TestBatchesTable>
              </Suspense>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}

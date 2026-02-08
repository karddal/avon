import { Suspense } from "react";
import CourseworkList from "@/components/coursework/coursework-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BulkDelete from "@/components/management/bulk-delete"
import BulkSwitch from "@/components/management/bulk-switch";
import AccountSettings from "@/components/settings/account-settings"
import ListMembers from "@/components/management/list-users";
async function PageContent() {
  return (
    <div className="mt-6 px-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Search
            </h3>
            <ListMembers/>
        </div>
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Account
            </h3>
            <AccountSettings/>
        </div>
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Bulk Delete Users
            </h3>
            <BulkDelete/>
        </div>
        <div className="rounded-md border border-border p-4">
            <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Bulk re-enroll Users
            </h3>
            <BulkSwitch/>
        </div>
    </div>
  );
}

export default function CourseworkPage() {
  return (
    <Suspense>
      <PageContent />
    </Suspense>
  );
}

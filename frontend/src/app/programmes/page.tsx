import { ClipboardPlus } from "lucide-react";
import Link from "next/dist/client/link";
import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/auth-utils";

async function PageContent() {
  const s = await requireAdminSession();
  let userRole = s.user.role;

  if (!userRole) {
    userRole = "user";
  }

  return (
    <>
      {userRole === "admin" && (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link
            href={{
              pathname: "/programmes/create_programme",
            }}
          >
            <ClipboardPlus />
            Add programme
          </Link>
        </Button>
      )}
    </>
  );
}

export default function ProgrammesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent />
    </Suspense>
  );
}

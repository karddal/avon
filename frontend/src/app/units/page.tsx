import { Suspense } from "react";
import Loading from "@/app/coursework/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnitList from "@/components/unit-list";
import YearSelector from "@/components/year-selector";
import { cookies } from "next/headers";
import TabSwitcher from "@/components/tab-switcher";

type Status = "ongoing" | "finished";

interface PageProps {
  searchParams: Promise<{ year?: string; tab?: Status }>
}

async function PageContent({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // const [year, setYear] = useState<number | null>(null);
  // const [activeTab, setActiveTab] = useState<Status>("ongoing");

  // defer `new Date()` in useEffect to avoid pre-render errors
  // useEffect(() => {
  //   setYear(new Date().getFullYear());
  // }, []);

  // if (year === null) return null; // wait until client time is ready
  const params = await searchParams;
  const yearNow = new Date().getFullYear()
  const currentYear = params.year ? parseInt(params.year) : new Date().getFullYear()
  const currentAcademicYear = `${currentYear}/${currentYear + 1}`

  const activeTab = (params.tab || "ongoing") as Status

  return (
    <div className="space-y-6">
      <Tabs value={activeTab}>
        <TabsList className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-background my-8 md:my-4">
          <YearSelector value={currentYear} currentTab={activeTab} />
          <TabSwitcher currentYear={currentYear} activeTab={activeTab} yearNow={yearNow} />
          {/* <div className="bg-accent p-1 flex gap-2">
            <TabsTrigger value="ongoing" className="bg-accent px-4 py-2">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="finished" className="bg-accent px-4 py-2">
              Finished
            </TabsTrigger>
          </div> */}
        </TabsList>

        <TabsContent value="ongoing">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList currentYear={currentYear} finished={false} token={token} />
            </section>
          </Suspense>
        </TabsContent>
        <TabsContent value="finished">
          <Suspense fallback={<Loading></Loading>}>
            <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <UnitList currentYear={currentYear} finished={true} token={token} />
            </section>
          </Suspense>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground pl-2">
        Academic Year: {currentAcademicYear}
      </div>
    </div>
  )
}




export default function UnitPage({ searchParams }: PageProps) {
  // const [year, setYear] = useState<number | null>(null);
  // const [activeTab, setActiveTab] = useState<Status>("ongoing");

  // // defer `new Date()` in useEffect to avoid pre-render errors
  // useEffect(() => {
  //   setYear(new Date().getFullYear());
  // }, []);

  // if (year === null) return null; // wait until client time is ready

  // const currentAcademicYear = `${year}/${year + 1}`;

  return (
    <Suspense>
      <PageContent searchParams={searchParams} />
    </Suspense>
  );
}

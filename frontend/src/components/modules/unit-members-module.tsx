import { ScrollArea } from "@/components/ui/scroll-area";
import Lecturers from "../units/lecturers";

type Lecturer = {
  id: string;
  name: string;
  image: string;
  role: boolean;
};

export default function UnitMembersModule({
  lecturers,
}: {
  lecturers: Lecturer[];
}) {
  return (
    <div className="flex h-[15rem] min-h-0 max-h-[18rem] flex-col p-4 sm:h-[16rem] sm:max-h-[20rem] sm:p-5 md:h-[18rem] md:max-h-[22rem] 2xl:h-full 2xl:max-h-none">
      <div className="mb-3 shrink-0">
        <div className="text-2xl font-semibold">Unit Staff</div>
        <div className="font-light">Lecturers and teachers appear here</div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-1">
          <div className="pr-3">
            <Lecturers lecturers={lecturers} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

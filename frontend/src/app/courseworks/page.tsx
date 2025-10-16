import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function courseworkListing() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/units">
          <div className="bg-amber-400 w-full h-2"></div>
          <Card className="bg-muted flex flex-col p-2 hover:bg-foreground/10">
                <div className="flex flex-row justify-between">
                    <p className="text-2xl font-semibold">
                        Teddy Bear
                    </p>
                    <p className="text-2xl text-muted-foreground">
                        Due: 20/12/2024
                    </p>
                </div>
                <div className="flex flex-row gap-4">
                    <Progress value={45} className="w-3/5 mt-2"/>
                    <strong>70%</strong>
                </div>
          </Card>
        </Link>
        <Link href="/units">
          <div className="bg-purple-400 w-full h-2"></div>
          <Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-col">
                <p className="text-2xl flex flex-row gap-2 items-center">
                  Unit Name
                </p>
                <br />
                <div className="flex flex-row gap-4">
                  <p>
                    <strong>1</strong> coursework assigned
                  </p>
                  <p>
                    Current Mark: <strong>70%</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/units">
          <div className="bg-red-400 w-full h-2"></div>
          <Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-col">
                <p className="text-2xl flex flex-row gap-2 items-center">
                  Unit Name
                </p>
                <br />
                <div className="flex flex-row gap-4">
                  <p>
                    <strong>1</strong> coursework assigned
                  </p>
                  <p>
                    Current Mark: <strong>70%</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/units">
          <div className="bg-blue-400 w-full h-2"></div>
          <Card className="bg-muted flex flex-row p-2 items-center hover:bg-foreground/10">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex flex-col">
                <p className="text-2xl flex flex-row gap-2 items-center">
                  Unit Name
                </p>
                <br />
                <div className="flex flex-row gap-4">
                  <p>
                    <strong>1</strong> coursework assigned
                  </p>
                  <p>
                    Current Mark: <strong>70%</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </section>
    </div>
  );
}

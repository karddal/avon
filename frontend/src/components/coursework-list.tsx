import { PlusIcon } from "lucide-react";
import Link from "next/link";
import Coursework from "@/components/coursework";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type courseworkData = {
  id: string;
  name: string;
  code: string;
  year: number;
  finished: boolean;
  color: string;
  creation_date: string;
  due_date: string;
  testsPassed: number;
  totalTests: number;
};


export default async function CourseworkList({ 
  finished,
  token,
}: {
  finished: boolean;
  token?: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/me/courseworks`,
    {
      method: "GET",
      headers: {
        Cookie: `access_token=${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    
    // Use console.log for better visibility in server logs
    console.log('=== API Error Details ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Body:', errorText);
    console.log('Has Token:', !!token);
    console.log('Token Preview:', token?.substring(0, 20) + '...');
    console.log('========================');
    
    // Return error UI instead of throwing
    return (
      <Card className="p-5">
        <CardTitle>Failed to Load Courseworks</CardTitle>
        <CardDescription>
          Error {response.status}: {response.statusText || 'Unknown error'}
          {errorText && <div className="mt-2 text-xs">{errorText}</div>}
        </CardDescription>
      </Card>
    );
  }

  const courseworkListData: courseworkData[] = await response.json();

  const now = new Date();

  const filtered = courseworkListData.filter((coursework) => {
    const created = new Date(coursework.creation_date);
    const due = new Date(coursework.due_date);

    const isActive = now >= created && now <= due;

    if (finished) {
      return now > due;
    }

    return isActive;
  });

  return (
    <>
      <Link href="/courseworks/create">
        <Card className="bg-muted/50 flex flex-row p-5 h-full items-center hover:bg-foreground/10">
          <PlusIcon size={50} />
          <div className="flex flex-col">
            <CardTitle className="text-xl font-medium">
              Add new Coursework
            </CardTitle>
            <CardDescription>Create a new coursework here.</CardDescription>
          </div>
        </Card>
      </Link>
      {filtered.length > 0 &&
        filtered.map((coursework) => (
          <Coursework key={coursework.id} props={coursework} />
        ))}
    </>
  );
}

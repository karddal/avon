import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </div>
  );
}

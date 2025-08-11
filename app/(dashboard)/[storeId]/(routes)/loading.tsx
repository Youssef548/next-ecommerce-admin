import Skeleton from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="grid gap-4 grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="p-6 border rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-[350px] w-full" />
        </div>
      </div>
    </div>
  );
}

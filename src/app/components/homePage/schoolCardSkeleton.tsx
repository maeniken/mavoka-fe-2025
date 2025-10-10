export function SchoolCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[8px] border border-[#D6DDEB] bg-white shadow-sm p-4 flex gap-4 animate-pulse ${className}`}>
      <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="mt-auto h-8 bg-gray-300 rounded w-32" />
      </div>
    </div>
  );
}

export function LpkCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[8px] border border-[#D6DDEB] bg-white shadow-sm overflow-hidden animate-pulse flex flex-col ${className}`}>
      <div className="h-20 w-full bg-gray-200" />
      <div className="flex flex-col items-center p-4 gap-3 flex-1 w-full">
        <div className="w-16 h-16 bg-gray-200 rounded-full -mt-12 border-4 border-white" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="mt-auto w-full h-9 bg-gray-300 rounded" />
      </div>
    </div>
  );
}

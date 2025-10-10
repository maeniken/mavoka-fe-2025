export default function CompanyCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 flex flex-col items-center text-center gap-3 shadow-sm animate-pulse ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gray-200" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="mt-auto h-8 bg-gray-300 rounded w-full" />
    </div>
  );
}

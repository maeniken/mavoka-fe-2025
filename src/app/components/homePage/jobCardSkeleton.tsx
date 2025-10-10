export default function JobCardSkeleton() {
  return (
    <div className="border p-4 shadow-md h-full flex flex-col animate-pulse">
      {/* Header area (same min height as JobCard header) */}
      <div className="mb-2 min-h-[80px] w-full">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>

      {/* Logo placeholder */}
      <div className="w-12 h-12 mb-2 bg-gray-200 rounded-full" />

      {/* Company + location lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>

      <div className="mt-auto" />

      <hr className="border-gray-200 mb-3" />

      <div className="bg-gray-100 rounded-md px-3 py-4">
        <div className="h-3 bg-gray-200 rounded w-3/5" />
      </div>

      <div className="mt-3 h-9 bg-gray-300 rounded-md" />
    </div>
  );
}

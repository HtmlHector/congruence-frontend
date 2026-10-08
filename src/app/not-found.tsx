import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-white p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white/90">404 - Not Found</h1>
        <p className="text-sm text-white/60">
          The requested workspace, route, or resource could not be found.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
        >
          Return to Workspace
        </Link>
      </div>
    </div>
  );
}

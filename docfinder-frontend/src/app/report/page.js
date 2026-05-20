export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import ReportForm from "./ReportForm";
import { Suspense } from "react";

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xl font-bold text-slate-600 animate-pulse">🤖 Loading Reporting Portal...</div>
      </div>
    }>
      <ReportForm />
    </Suspense>
  );
}
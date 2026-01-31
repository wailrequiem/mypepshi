import { ScanFlow } from "@/components/scan/ScanFlow";
import { AppHeader } from "@/components/layout/AppHeader";

export default function NewScan() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with hamburger menu */}
      <AppHeader title="New Scan" />

      {/* Scan Flow - will save to localStorage and redirect to paywall */}
      <div className="flex-1">
        <ScanFlow mode="newScan" />
      </div>
    </div>
  );
}

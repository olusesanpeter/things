"use client";

import { ThingStatus } from "@/lib/types";

interface StatusFilterProps {
  selectedStatus: ThingStatus | "all";
  onStatusChange: (status: ThingStatus | "all") => void;
}

export default function StatusFilter({
  selectedStatus,
  onStatusChange,
}: StatusFilterProps) {
  const statuses: (ThingStatus | "all")[] = ["all", "like", "have", "want"];

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => onStatusChange(status)}
          className={`px-2 py-1 text-sm font-medium transition-colors ${
            selectedStatus === status
              ? "text-black underline"
              : "text-black/60 hover:text-black"
          }`}
          aria-pressed={selectedStatus === status}
        >
          {status === "all" ? "all" : status}
        </button>
      ))}
    </div>
  );
}


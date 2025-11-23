import { Thing } from "@/lib/types";
import ThingCard from "./ThingCard";

interface ThingsGridProps {
  things: Thing[];
}

export default function ThingsGrid({ things }: ThingsGridProps) {
  if (things.length === 0) {
    return (
      <div className="text-center py-12 text-black/60" role="status" aria-live="polite">
        No things found for this filter.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" role="list">
      {Array.from({ length: Math.ceil(things.length / 3) }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-6 flex-wrap">
          {things.slice(rowIndex * 3, rowIndex * 3 + 3).map((thing) => (
            <div key={thing.id} className="flex-1 min-w-[280px] max-w-[445px]" role="listitem">
              <ThingCard thing={thing} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}


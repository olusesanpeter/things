import Image from "next/image";
import { Thing } from "@/lib/types";

interface ThingCardProps {
  thing: Thing;
}

export default function ThingCard({ thing }: ThingCardProps) {
  return (
    <article className="flex flex-col gap-4">
      <div className="bg-[#d9d9d9] h-[294px] w-full overflow-hidden relative">
        {thing.image && thing.image !== "/placeholder.jpg" ? (
          <Image
            src={thing.image}
            alt={thing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 445px"
          />
        ) : (
          <div className="w-full h-full" aria-hidden="true" />
        )}
      </div>
      <h2 className="font-medium text-[24px] leading-normal text-black tracking-[-1.2px]">
        {thing.title}
      </h2>
    </article>
  );
}


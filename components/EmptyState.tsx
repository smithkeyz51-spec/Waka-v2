import { Bus } from "lucide-react";

interface Props {
  city: string;
  hasSearch: boolean;
}

export default function EmptyState({ city, hasSearch }: Props) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-12 h-12 rounded-full bg-[#F7C548]/25 flex items-center justify-center mx-auto mb-3">
        <Bus size={20} className="text-[#1A1A1A]/50" />
      </div>
      {hasSearch ? (
        <>
          <p className="font-display font-semibold text-[#1A1A1A]/70">
            No fares match that search
          </p>
          <p className="text-sm text-[#1A1A1A]/45 mt-1">
            Try a different stop name, or log this fare yourself.
          </p>
        </>
      ) : (
        <>
          <p className="font-display font-semibold text-[#1A1A1A]/70">
            No fares logged for {city} yet
          </p>
          <p className="text-sm text-[#1A1A1A]/45 mt-1">
            Be the first — log what you paid to help the next person.
          </p>
        </>
      )}
    </div>
  );
}

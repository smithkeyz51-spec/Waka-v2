import { CITIES } from "@/lib/types";

interface Props {
  selected: string;
  onSelect: (city: string) => void;
}

export default function CitySelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {CITIES.map((city) => {
        const active = city === selected;
        return (
          <button
            key={city}
            onClick={() => onSelect(city)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${
              active
                ? "bg-[#1A1A1A] border-[#1A1A1A] text-[#F7C548]"
                : "bg-transparent border-[#1A1A1A]/15 text-[#1A1A1A]/60 hover:border-[#1A1A1A]/40"
            }`}
          >
            {city}
          </button>
        );
      })}
    </div>
  );
}

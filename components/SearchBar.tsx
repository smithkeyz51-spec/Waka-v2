import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/35"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search a route, e.g. Ojota to CMS"
        className="w-full rounded-xl border-2 border-[#1A1A1A]/10 bg-white pl-10 pr-3.5 py-2.5 text-sm focus:border-[#F7C548] outline-none"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Trophy, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { CityStats } from "@/lib/fares";

interface Props {
  city: string;
  stats: CityStats;
}

const COLLAPSED_COUNT = 5;

export default function CityStatsPanel({ city, stats }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (stats.totalFares === 0) {
    return null;
  }

  const contributors = showAll
    ? stats.topContributors
    : stats.topContributors.slice(0, COLLAPSED_COUNT);

  const hasMore = stats.topContributors.length > COLLAPSED_COUNT;

  return (
    <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F7C548]/30 flex items-center justify-center shrink-0">
            <TrendingUp size={15} className="text-[#1A1A1A]/70" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none text-[#1A1A1A]">
              {stats.totalFares}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/45">
              fares in {city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#2E7D5B]/15 flex items-center justify-center shrink-0">
            <TrendingUp size={15} className="text-[#2E7D5B]" />
          </div>
          <div>
            <p className="font-display font-bold text-lg leading-none text-[#1A1A1A]">
              {stats.today}
            </p>
            <p className="text-[11px] text-[#1A1A1A]/45">logged today</p>
          </div>
        </div>
      </div>

      {stats.topContributors.length > 0 && (
        <div className="border-t-2 border-[#1A1A1A]/8 pt-3">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Trophy size={14} className="text-[#E0AA1F]" />
            <p className="text-xs font-semibold text-[#1A1A1A]/70">
              {showAll ? "All contributors" : "Top contributors"}
            </p>
          </div>
          <div className="space-y-1.5">
            {contributors.map((c, i) => (
              <div
                key={c.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] text-[#1A1A1A]/30 w-4 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[#1A1A1A]/80 truncate">
                    {c.name}
                  </span>
                </div>
                <span className="text-[#1A1A1A]/45 text-xs shrink-0">
                  {c.count} {c.count === 1 ? "fare" : "fares"}
                </span>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mt-2.5 flex items-center gap-1 text-xs font-medium text-[#1A1A1A]/50"
            >
              {showAll ? (
                <>
                  Show less <ChevronUp size={13} />
                </>
              ) : (
                <>
                  See all {stats.topContributors.length} contributors{" "}
                  <ChevronDown size={13} />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

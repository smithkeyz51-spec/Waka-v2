import { ArrowRight, Trash2 } from "lucide-react";
import { Fare, TIME_LABELS, VEHICLE_LABELS } from "@/lib/types";

interface Props {
  fare: Fare;
  canDelete: boolean;
  onDelete?: (id: string) => void;
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function FareCard({ fare, canDelete, onDelete }: Props) {
  const loggedBy = fare.userName || (fare.userId ? "Waka user" : "Guest");

  return (
    <div className="rounded-xl border-2 border-[#1A1A1A]/10 bg-white p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="route-board flex items-center gap-1.5 text-[#1A1A1A] font-semibold text-[15px] truncate">
          <span className="truncate">{fare.from}</span>
          <ArrowRight size={14} className="shrink-0 text-[#1A1A1A]/40" />
          <span className="truncate">{fare.to}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F7C548]/30 text-[#1A1A1A]/70 font-medium">
            {VEHICLE_LABELS[fare.vehicleType]}
          </span>
          <span className="text-[11px] text-[#1A1A1A]/40">
            {TIME_LABELS[fare.timeOfDay]} · {timeAgo(fare.createdAt)}
          </span>
        </div>
        <p className="text-[11px] text-[#1A1A1A]/40 mt-0.5">
          Logged by <span className="font-medium">{loggedBy}</span>
        </p>
        {fare.note && (
          <p className="text-xs text-[#1A1A1A]/50 mt-1 italic truncate">
            &ldquo;{fare.note}&rdquo;
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="font-display font-bold text-lg text-[#1A1A1A]">
          ₦{fare.amount.toLocaleString()}
        </div>
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(fare.id)}
            className="text-[#1A1A1A]/25 hover:text-red-600 transition-colors"
            aria-label="Delete fare"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

import { FINGER_IDS, FINGER_LABELS, FingerId, NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

interface NailRowProps {
  fingerDesigns: Record<FingerId, NailDesign>;
  activeFinger?: FingerId | "all";
  onSelectFinger?: (id: FingerId) => void;
}

export default function NailRow({ fingerDesigns, activeFinger = "all", onSelectFinger }: NailRowProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {FINGER_IDS.map((id) => {
        const design = fingerDesigns[id];
        const def = NAIL_SHAPES[design.shape];
        const active = activeFinger === id;
        return (
          <button
            key={id}
            onClick={() => onSelectFinger?.(id)}
            className={`rounded-xl border p-2 flex flex-col items-center gap-1.5 transition-colors ${
              active ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white hover:border-pink-300"
            }`}
          >
            <div className="h-20 w-full flex items-center justify-center">
              <svg viewBox={def.viewBox} className="h-full drop-shadow">
                <NailGraphic uid={`row-${id}`} {...design} />
              </svg>
            </div>
            <span className={`text-[11px] font-medium ${active ? "text-pink-600" : "text-gray-500"}`}>
              {FINGER_LABELS[id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

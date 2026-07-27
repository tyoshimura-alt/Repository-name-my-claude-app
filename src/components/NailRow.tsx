import {
  FINGER_IDS,
  FINGER_LABELS,
  HAND_LABELS,
  HANDS,
  Hand,
  NAIL_IDS,
  NAIL_SHAPES,
  NailDesign,
  NailId,
  nailBoxSize,
  nailFinger,
} from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

const NEUTRAL_HEIGHT = 72;
const ROW_BOX_PADDING = 4;

interface NailRowProps {
  nailDesigns: Record<NailId, NailDesign>;
  activeNail?: NailId | "all";
  onSelectNail?: (id: NailId) => void;
}

export default function NailRow({ nailDesigns, activeNail = "all", onSelectNail }: NailRowProps) {
  // Shared box height across all 10 cards, sized to whatever the tallest nail *currently*
  // needs (length level + finger scale) rather than a hardcoded worst case. Keeps every
  // card border the same size while still leaving a visible gap above shorter nails.
  const containerHeight =
    Math.max(
      ...NAIL_IDS.map((id) => {
        const d = nailDesigns[id];
        return nailBoxSize(d.shape, NEUTRAL_HEIGHT, d.length, nailFinger(id)).height;
      })
    ) + ROW_BOX_PADDING;

  return (
    <div className="space-y-3">
      {HANDS.map((hand) => (
        <HandRow
          key={hand}
          hand={hand}
          nailDesigns={nailDesigns}
          activeNail={activeNail}
          onSelectNail={onSelectNail}
          containerHeight={containerHeight}
        />
      ))}
    </div>
  );
}

function HandRow({
  hand,
  nailDesigns,
  activeNail,
  onSelectNail,
  containerHeight,
}: {
  hand: Hand;
  nailDesigns: Record<NailId, NailDesign>;
  activeNail: NailId | "all";
  onSelectNail?: (id: NailId) => void;
  containerHeight: number;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-400 mb-1">{HAND_LABELS[hand]}</p>
      <div className="grid grid-cols-5 gap-2">
        {FINGER_IDS.map((finger) => {
          const id = `${hand}_${finger}` as NailId;
          const design = nailDesigns[id];
          const active = activeNail === id;
          const { width, height } = nailBoxSize(design.shape, NEUTRAL_HEIGHT, design.length, finger);
          return (
            <button
              key={id}
              onClick={() => onSelectNail?.(id)}
              className={`rounded-xl border p-2 flex flex-col items-center gap-1.5 transition-colors ${
                active ? "border-pink-500 bg-pink-50" : "border-gray-200 bg-white hover:border-pink-300"
              }`}
            >
              <div style={{ height: containerHeight }} className="w-full flex items-end justify-center">
                <svg
                  width={width}
                  height={height}
                  viewBox={NAIL_SHAPES[design.shape].viewBox}
                  preserveAspectRatio="none"
                  className="drop-shadow"
                >
                  <NailGraphic uid={`row-${id}`} {...design} />
                </svg>
              </div>
              <span className={`text-[11px] font-medium ${active ? "text-pink-600" : "text-gray-500"}`}>
                {FINGER_LABELS[finger]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

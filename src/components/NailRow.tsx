import {
  FINGER_IDS,
  FINGER_LABELS,
  HAND_LABELS,
  HANDS,
  Hand,
  LENGTH_SCALE,
  NAIL_SHAPES,
  NailDesign,
  NailId,
  nailBoxSize,
} from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

const NEUTRAL_HEIGHT = 72;
const MAX_LENGTH_SCALE = Math.max(...Object.values(LENGTH_SCALE));
const PREVIEW_BOX_HEIGHT = Math.ceil(NEUTRAL_HEIGHT * MAX_LENGTH_SCALE);

interface NailRowProps {
  nailDesigns: Record<NailId, NailDesign>;
  activeNail?: NailId | "all";
  onSelectNail?: (id: NailId) => void;
}

export default function NailRow({ nailDesigns, activeNail = "all", onSelectNail }: NailRowProps) {
  return (
    <div className="space-y-3">
      {HANDS.map((hand) => (
        <HandRow
          key={hand}
          hand={hand}
          nailDesigns={nailDesigns}
          activeNail={activeNail}
          onSelectNail={onSelectNail}
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
}: {
  hand: Hand;
  nailDesigns: Record<NailId, NailDesign>;
  activeNail: NailId | "all";
  onSelectNail?: (id: NailId) => void;
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
              <div style={{ height: PREVIEW_BOX_HEIGHT }} className="w-full flex items-end justify-center">
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

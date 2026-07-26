import { FingerId, NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

interface FingerConfig {
  id: FingerId;
  cx: number;
  baseY: number;
  tipY: number;
  baseWidth: number;
  tipWidth: number;
  rotate: number;
}

// Left to right: index sits beside the thumb; pinky is farthest from it — matching real hand anatomy.
// Fingers fan out a few degrees each, rather than standing perfectly parallel, the way relaxed fingers do.
const FINGERS: FingerConfig[] = [
  { id: "index", cx: 172, baseY: 300, tipY: 112, baseWidth: 42, tipWidth: 30, rotate: -8 },
  { id: "middle", cx: 240, baseY: 300, tipY: 76, baseWidth: 46, tipWidth: 33, rotate: -2 },
  { id: "ring", cx: 306, baseY: 300, tipY: 106, baseWidth: 43, tipWidth: 31, rotate: 6 },
  { id: "pinky", cx: 368, baseY: 300, tipY: 158, baseWidth: 36, tipWidth: 26, rotate: 13 },
];

const THUMB: FingerConfig = {
  id: "thumb",
  cx: 95,
  baseY: 372,
  tipY: 258,
  baseWidth: 52,
  tipWidth: 40,
  rotate: -23,
};

const PALM_PATH =
  "M 151 300 " +
  "Q 172 286 193 300 " +
  "Q 205 318 217 300 " +
  "Q 240 284 263 300 " +
  "Q 274 318 284.5 300 " +
  "Q 306 286 327.5 300 " +
  "Q 339 318 350 300 " +
  "Q 368 286 386 300 " +
  "C 398 328 392 392 362 432 " +
  "L 148 432 " +
  "C 106 424 80 386 88 338 " +
  "C 94 312 122 296 151 300 " +
  "Z";

/** A tapered finger silhouette: wide at the base (blends into the palm), narrow and rounded at the tip. */
function fingerPath(f: FingerConfig): string {
  const bw = f.baseWidth / 2;
  const tw = f.tipWidth / 2;
  const leftBase = f.cx - bw;
  const rightBase = f.cx + bw;
  const leftTip = f.cx - tw;
  const rightTip = f.cx + tw;
  const tipShoulder = f.tipY + tw;
  const midY = tipShoulder + (f.baseY - tipShoulder) * 0.5;
  return (
    `M ${leftBase} ${f.baseY} ` +
    `C ${leftBase} ${midY}, ${leftTip} ${midY}, ${leftTip} ${tipShoulder} ` +
    `A ${tw} ${tw} 0 0 1 ${rightTip} ${tipShoulder} ` +
    `C ${rightTip} ${midY}, ${rightBase} ${midY}, ${rightBase} ${f.baseY} ` +
    `Z`
  );
}

interface HandPreviewProps {
  fingerDesigns: Record<FingerId, NailDesign>;
  skinColor: string;
  activeFinger?: FingerId | "all";
  onSelectFinger?: (id: FingerId) => void;
}

function Finger({
  finger,
  design,
  skinColor,
  active,
  onSelect,
}: {
  finger: FingerConfig;
  design: NailDesign;
  skinColor: string;
  active: boolean;
  onSelect?: (id: FingerId) => void;
}) {
  const def = NAIL_SHAPES[design.shape];
  const nailWidth = finger.tipWidth * 1.4;
  const nailHeight = (nailWidth / 100) * def.viewBox.split(" ").map(Number)[3];
  const nailX = finger.cx - nailWidth / 2;
  const nailY = finger.tipY - nailHeight * 0.46;

  return (
    <g
      transform={`rotate(${finger.rotate} ${finger.cx} ${finger.baseY})`}
      onClick={onSelect ? () => onSelect(finger.id) : undefined}
      style={onSelect ? { cursor: "pointer" } : undefined}
    >
      <path d={fingerPath(finger)} fill={skinColor} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
      {active && (
        <ellipse
          cx={finger.cx}
          cy={finger.tipY + finger.tipWidth * 0.1}
          rx={finger.tipWidth * 0.95}
          ry={finger.tipWidth * 1.15}
          fill="none"
          stroke="var(--nail-active-ring, #ec4899)"
          strokeWidth={2.5}
          opacity={0.85}
        />
      )}
      <svg
        x={nailX}
        y={nailY}
        width={nailWidth}
        height={nailHeight}
        viewBox={def.viewBox}
        overflow="visible"
      >
        <NailGraphic uid={`${finger.id}`} {...design} />
      </svg>
    </g>
  );
}

export default function HandPreview({
  fingerDesigns,
  skinColor,
  activeFinger = "all",
  onSelectFinger,
}: HandPreviewProps) {
  return (
    <svg viewBox="0 0 480 460" className="w-full h-full">
      <defs>
        <linearGradient id="hand-shade" x1="0%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.07} />
        </linearGradient>
      </defs>

      <path d={PALM_PATH} fill={skinColor} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />

      {/* faint tendon lines running from each knuckle toward the wrist */}
      <g stroke="rgba(0,0,0,0.06)" strokeWidth={1.2} fill="none">
        {FINGERS.map((f) => (
          <path
            key={f.id}
            d={`M ${f.cx} ${f.baseY} C ${f.cx} ${f.baseY + 45}, ${240 + (f.cx - 240) * 0.35} ${385}, ${240 + (f.cx - 240) * 0.18} ${420}`}
          />
        ))}
      </g>
      {/* wrist crease */}
      <path d="M 165 424 Q 255 438 345 424" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={1.2} />

      <Finger
        finger={THUMB}
        design={fingerDesigns.thumb}
        skinColor={skinColor}
        active={activeFinger === "thumb"}
        onSelect={onSelectFinger}
      />
      {FINGERS.map((f) => (
        <Finger
          key={f.id}
          finger={f}
          design={fingerDesigns[f.id]}
          skinColor={skinColor}
          active={activeFinger === f.id}
          onSelect={onSelectFinger}
        />
      ))}
      <path d={PALM_PATH} fill="url(#hand-shade)" stroke="none" />
    </svg>
  );
}

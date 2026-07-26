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
  cx: 100,
  baseY: 400,
  tipY: 284,
  baseWidth: 52,
  tipWidth: 40,
  rotate: -23,
};

const WRIST_LEFT = { x: 140, y: 500 };
const WRIST_RIGHT = { x: 345, y: 500 };

interface Pt {
  x: number;
  y: number;
}

function rotate(p: Pt, origin: Pt, deg: number): Pt {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: origin.x + dx * cos - dy * sin, y: origin.y + dx * sin + dy * cos };
}

interface FingerGeo {
  leftBase: Pt;
  leftC1: Pt;
  leftC2: Pt;
  leftTip: Pt;
  rightTip: Pt;
  rightC1: Pt;
  rightC2: Pt;
  rightBase: Pt;
  tw: number;
}

/** All key points of one tapered finger, rotated into the hand's shared coordinate space. */
function fingerGeo(f: FingerConfig): FingerGeo {
  const bw = f.baseWidth / 2;
  const tw = f.tipWidth / 2;
  const tipShoulder = f.tipY + tw;
  const midY = tipShoulder + (f.baseY - tipShoulder) * 0.5;
  const origin = { x: f.cx, y: f.baseY };
  const local: Record<string, Pt> = {
    leftBase: { x: f.cx - bw, y: f.baseY },
    leftC1: { x: f.cx - bw, y: midY },
    leftC2: { x: f.cx - tw, y: midY },
    leftTip: { x: f.cx - tw, y: tipShoulder },
    rightTip: { x: f.cx + tw, y: tipShoulder },
    rightC1: { x: f.cx + tw, y: midY },
    rightC2: { x: f.cx + bw, y: midY },
    rightBase: { x: f.cx + bw, y: f.baseY },
  };
  const out: Record<string, Pt> = {};
  for (const key of Object.keys(local)) out[key] = rotate(local[key], origin, f.rotate);
  return { ...(out as unknown as FingerGeo), tw };
}

function fingerOutline(g: FingerGeo): string {
  return (
    `C ${g.leftC1.x} ${g.leftC1.y}, ${g.leftC2.x} ${g.leftC2.y}, ${g.leftTip.x} ${g.leftTip.y} ` +
    `A ${g.tw} ${g.tw} 0 0 1 ${g.rightTip.x} ${g.rightTip.y} ` +
    `C ${g.rightC1.x} ${g.rightC1.y}, ${g.rightC2.x} ${g.rightC2.y}, ${g.rightBase.x} ${g.rightBase.y} `
  );
}

function webCurve(from: Pt, to: Pt, dip: number): string {
  const midX = (from.x + to.x) / 2;
  const midY = Math.max(from.y, to.y) + dip;
  return `Q ${midX} ${midY} ${to.x} ${to.y} `;
}

/**
 * The entire hand — palm, wrist and every finger — as a single continuous outline,
 * so it reads as one hand rather than separate shapes glued together.
 */
function buildHandPath(): { path: string; geo: Record<FingerId, FingerGeo> } {
  const th = fingerGeo(THUMB);
  const idx = fingerGeo(FINGERS[0]);
  const mid = fingerGeo(FINGERS[1]);
  const ring = fingerGeo(FINGERS[2]);
  const pinky = fingerGeo(FINGERS[3]);

  let d = `M ${WRIST_LEFT.x} ${WRIST_LEFT.y} `;
  d += `C 68 460, 62 430, ${th.leftBase.x} ${th.leftBase.y} `;
  d += fingerOutline(th);
  d += webCurve(th.rightBase, idx.leftBase, 46);
  d += fingerOutline(idx);
  d += webCurve(idx.rightBase, mid.leftBase, 16);
  d += fingerOutline(mid);
  d += webCurve(mid.rightBase, ring.leftBase, 16);
  d += fingerOutline(ring);
  d += webCurve(ring.rightBase, pinky.leftBase, 16);
  d += fingerOutline(pinky);
  d += `C 412 340, 402 460, ${WRIST_RIGHT.x} ${WRIST_RIGHT.y} `;
  d += `Q 242 514 ${WRIST_LEFT.x} ${WRIST_LEFT.y} `;
  d += "Z";

  return { path: d, geo: { thumb: th, index: idx, middle: mid, ring, pinky } };
}

const HAND = buildHandPath();

interface HandPreviewProps {
  fingerDesigns: Record<FingerId, NailDesign>;
  skinColor: string;
  activeFinger?: FingerId | "all";
  onSelectFinger?: (id: FingerId) => void;
}

function FingerNail({
  finger,
  design,
  active,
  onSelect,
}: {
  finger: FingerConfig;
  design: NailDesign;
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
      {onSelect && (
        <rect
          x={finger.cx - finger.baseWidth / 2}
          y={finger.tipY - finger.tipWidth}
          width={finger.baseWidth}
          height={finger.baseY - finger.tipY + finger.tipWidth}
          fill="transparent"
        />
      )}
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
    <svg viewBox="0 0 480 520" className="w-full h-full">
      <defs>
        <linearGradient id="hand-shade" x1="0%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.07} />
        </linearGradient>
      </defs>

      <path d={HAND.path} fill={skinColor} stroke="rgba(0,0,0,0.14)" strokeWidth={1.2} />

      {/* faint tendon lines running from each knuckle toward the wrist */}
      <g stroke="rgba(0,0,0,0.06)" strokeWidth={1.2} fill="none">
        {FINGERS.map((f) => (
          <path
            key={f.id}
            d={`M ${f.cx} ${f.baseY} C ${f.cx} ${f.baseY + 55}, ${268 + (f.cx - 268) * 0.35} ${460}, ${268 + (f.cx - 268) * 0.18} ${485}`}
          />
        ))}
      </g>
      {/* wrist crease */}
      <path d="M 205 489 Q 268 503 333 489" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={1.2} />

      <path d={HAND.path} fill="url(#hand-shade)" stroke="none" />

      <FingerNail
        finger={THUMB}
        design={fingerDesigns.thumb}
        active={activeFinger === "thumb"}
        onSelect={onSelectFinger}
      />
      {FINGERS.map((f) => (
        <FingerNail
          key={f.id}
          finger={f}
          design={fingerDesigns[f.id]}
          active={activeFinger === f.id}
          onSelect={onSelectFinger}
        />
      ))}
    </svg>
  );
}

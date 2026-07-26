import { NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

interface FingerConfig {
  id: string;
  cx: number;
  baseY: number;
  tipY: number;
  baseWidth: number;
  tipWidth: number;
  rotate?: number;
  rotateOrigin?: [number, number];
}

// Left to right: index sits beside the thumb; pinky is farthest from it — matching real hand anatomy.
const FINGERS: FingerConfig[] = [
  { id: "index", cx: 178, baseY: 286, tipY: 100, baseWidth: 48, tipWidth: 36 },
  { id: "middle", cx: 238, baseY: 286, tipY: 68, baseWidth: 54, tipWidth: 40 },
  { id: "ring", cx: 298, baseY: 286, tipY: 96, baseWidth: 50, tipWidth: 38 },
  { id: "pinky", cx: 358, baseY: 286, tipY: 152, baseWidth: 44, tipWidth: 34 },
];

const THUMB: FingerConfig = {
  id: "thumb",
  cx: 100,
  baseY: 358,
  tipY: 248,
  baseWidth: 58,
  tipWidth: 44,
  rotate: -26,
  rotateOrigin: [100, 358],
};

const PALM_PATH =
  "M 154 278 " +
  "Q 178 264 202 278 " +
  "Q 206 296 211 278 " +
  "Q 238 260 265 278 " +
  "Q 269 296 273 278 " +
  "Q 298 262 323 278 " +
  "Q 329 296 336 278 " +
  "Q 358 264 380 278 " +
  "C 392 305 386 365 360 407 " +
  "L 140 407 " +
  "C 100 400 78 365 85 320 " +
  "C 90 295 118 280 154 278 " +
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
  design: NailDesign;
  skinColor: string;
}

function Finger({
  finger,
  design,
  skinColor,
}: {
  finger: FingerConfig;
  design: NailDesign;
  skinColor: string;
}) {
  const def = NAIL_SHAPES[design.shape];
  const nailWidth = finger.tipWidth * 1.35;
  const nailHeight = (nailWidth / 100) * def.viewBox.split(" ").map(Number)[3];
  const nailX = finger.cx - nailWidth / 2;
  const nailY = finger.tipY - nailHeight * 0.46;

  const content = (
    <>
      <path
        d={fingerPath(finger)}
        fill={skinColor}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth={1}
      />
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
    </>
  );

  if (finger.rotate) {
    const [ox, oy] = finger.rotateOrigin ?? [0, 0];
    return <g transform={`rotate(${finger.rotate} ${ox} ${oy})`}>{content}</g>;
  }
  return <g>{content}</g>;
}

export default function HandPreview({ design, skinColor }: HandPreviewProps) {
  return (
    <svg viewBox="0 0 480 420" className="w-full h-full">
      <defs>
        <linearGradient id="hand-shade" x1="0%" y1="0%" x2="65%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="55%" stopColor="#ffffff" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.07} />
        </linearGradient>
      </defs>

      <path
        d={PALM_PATH}
        fill={skinColor}
        stroke="rgba(0,0,0,0.12)"
        strokeWidth={1}
      />
      <Finger finger={THUMB} design={design} skinColor={skinColor} />
      {FINGERS.map((f) => (
        <Finger key={f.id} finger={f} design={design} skinColor={skinColor} />
      ))}
      <path d={PALM_PATH} fill="url(#hand-shade)" stroke="none" />
    </svg>
  );
}

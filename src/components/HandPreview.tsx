import { NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

interface FingerConfig {
  id: string;
  x: number;
  width: number;
  topY: number;
  bottomY: number;
  rotate?: number;
  rotateOrigin?: [number, number];
}

const FINGERS: FingerConfig[] = [
  { id: "pinky", x: 165, width: 52, topY: 150, bottomY: 250 },
  { id: "ring", x: 232, width: 60, topY: 92, bottomY: 250 },
  { id: "middle", x: 302, width: 62, topY: 62, bottomY: 250 },
  { id: "index", x: 372, width: 58, topY: 100, bottomY: 250 },
];

const THUMB: FingerConfig = {
  id: "thumb",
  x: 95,
  width: 66,
  topY: 205,
  bottomY: 300,
  rotate: -32,
  rotateOrigin: [128, 300],
};

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
  const nailHeight = (finger.width / 100) * def.viewBox.split(" ").map(Number)[3];
  const nailWidth = finger.width * 1.02;
  const nailX = finger.x + (finger.width - nailWidth) / 2;
  const nailY = finger.topY - nailHeight * 0.42;

  const content = (
    <>
      <rect
        x={finger.x}
        y={finger.topY}
        width={finger.width}
        height={finger.bottomY - finger.topY}
        rx={finger.width / 2}
        fill={skinColor}
        stroke="rgba(0,0,0,0.08)"
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
    <svg viewBox="0 0 560 340" className="w-full h-full">
      {/* palm */}
      <rect
        x={130}
        y={225}
        width={310}
        height={130}
        rx={55}
        fill={skinColor}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth={1}
      />
      <Finger finger={THUMB} design={design} skinColor={skinColor} />
      {FINGERS.map((f) => (
        <Finger key={f.id} finger={f} design={design} skinColor={skinColor} />
      ))}
    </svg>
  );
}

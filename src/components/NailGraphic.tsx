import { GLITTER_DOTS, NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";

interface NailGraphicProps extends NailDesign {
  uid: string;
}

export default function NailGraphic({
  uid,
  shape,
  baseColor,
  pattern,
  accentColor,
}: NailGraphicProps) {
  const def = NAIL_SHAPES[shape];
  const clipId = `clip-${uid}`;
  const gradId = `grad-${uid}`;
  const dotsId = `dots-${uid}`;
  const stripesId = `stripes-${uid}`;
  const blurId = `blur-${uid}`;
  const [vbX, vbY, vbW, vbH] = def.viewBox.split(" ").map(Number);
  const tipBandHeight = vbH * 0.32;
  const smileArch = vbH * 0.16;
  const smileSideY = vbY + tipBandHeight + smileArch;
  const smileCenterY = vbY + tipBandHeight - smileArch;
  const frenchTipPath =
    `M ${vbX} ${vbY} L ${vbX + vbW} ${vbY} L ${vbX + vbW} ${smileSideY} ` +
    `Q ${vbX + vbW / 2} ${smileCenterY} ${vbX} ${smileSideY} Z`;

  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <path d={def.path} />
        </clipPath>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={baseColor} />
          <stop offset="100%" stopColor={accentColor} />
        </linearGradient>
        <pattern
          id={dotsId}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="16" height="16" fill={baseColor} />
          <circle cx="8" cy="8" r="3" fill={accentColor} />
        </pattern>
        <pattern
          id={stripesId}
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="14" height="14" fill={baseColor} />
          <rect width="7" height="14" fill={accentColor} />
        </pattern>
        <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* base fill, always present under any pattern */}
        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={baseColor} />

        {pattern === "gradient" && (
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={`url(#${gradId})`} />
        )}

        {pattern === "dots" && (
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={`url(#${dotsId})`} />
        )}

        {pattern === "stripes" && (
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={`url(#${stripesId})`} />
        )}

        {pattern === "french" && <path d={frenchTipPath} fill={accentColor} />}

        {pattern === "glitter" && (
          <>
            <rect
              x={vbX}
              y={vbY}
              width={vbW}
              height={vbH}
              fill={accentColor}
              opacity={0.25}
            />
            {GLITTER_DOTS.map((d, i) => (
              <circle
                key={i}
                cx={d.cx}
                cy={vbY + (d.cy / 150) * vbH}
                r={d.r}
                fill="#ffffff"
                opacity={d.o}
              />
            ))}
          </>
        )}

        {pattern === "marble" && (
          <g filter={`url(#${blurId})`} opacity={0.55}>
            <ellipse cx={vbX + vbW * 0.35} cy={vbY + vbH * 0.3} rx={vbW * 0.28} ry={vbH * 0.18} fill={accentColor} />
            <ellipse cx={vbX + vbW * 0.7} cy={vbY + vbH * 0.55} rx={vbW * 0.22} ry={vbH * 0.14} fill={accentColor} />
            <ellipse cx={vbX + vbW * 0.4} cy={vbY + vbH * 0.8} rx={vbW * 0.3} ry={vbH * 0.16} fill={accentColor} />
          </g>
        )}
        {pattern === "marble" && (
          <g stroke={accentColor} strokeWidth={1.2} fill="none" opacity={0.7}>
            <path
              d={`M ${vbX + vbW * 0.15} ${vbY + vbH * 0.2} Q ${vbX + vbW * 0.5} ${vbY + vbH * 0.4} ${vbX + vbW * 0.3} ${vbY + vbH * 0.7} T ${vbX + vbW * 0.6} ${vbY + vbH * 0.95}`}
            />
            <path
              d={`M ${vbX + vbW * 0.75} ${vbY + vbH * 0.15} Q ${vbX + vbW * 0.55} ${vbY + vbH * 0.45} ${vbX + vbW * 0.8} ${vbY + vbH * 0.6}`}
            />
          </g>
        )}

        {/* subtle glossy highlight for all patterns */}
        <ellipse
          cx={vbX + vbW * 0.38}
          cy={vbY + vbH * 0.22}
          rx={vbW * 0.18}
          ry={vbH * 0.12}
          fill="#ffffff"
          opacity={0.25}
        />
      </g>

      <path
        d={def.path}
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1.5}
      />
    </g>
  );
}

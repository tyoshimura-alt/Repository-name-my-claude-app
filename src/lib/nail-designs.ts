export type FingerId = "thumb" | "index" | "middle" | "ring" | "pinky";

export const FINGER_IDS: FingerId[] = ["thumb", "index", "middle", "ring", "pinky"];

export const FINGER_LABELS: Record<FingerId, string> = {
  thumb: "親指",
  index: "人差し指",
  middle: "中指",
  ring: "薬指",
  pinky: "小指",
};

export type Hand = "left" | "right";

export const HANDS: Hand[] = ["left", "right"];

export const HAND_LABELS: Record<Hand, string> = {
  left: "左手",
  right: "右手",
};

export type NailId = `${Hand}_${FingerId}`;

export const NAIL_IDS: NailId[] = HANDS.flatMap((hand) =>
  FINGER_IDS.map((finger) => `${hand}_${finger}` as NailId)
);

export function nailHand(id: NailId): Hand {
  return id.split("_")[0] as Hand;
}

export function nailFinger(id: NailId): FingerId {
  return id.split("_")[1] as FingerId;
}

export function nailLabel(id: NailId): string {
  return `${HAND_LABELS[nailHand(id)]}${FINGER_LABELS[nailFinger(id)]}`;
}

export const NAIL_LENGTHS = [1, 2, 3, 4, 5] as const;

export const LENGTH_LABELS: Record<number, string> = {
  1: "短め",
  2: "やや短め",
  3: "標準",
  4: "やや長め",
  5: "長め",
};

// Visual height multiplier applied to a nail's rendered box (width stays fixed) so a
// higher length level looks like a longer nail without redrawing the shape path.
export const LENGTH_SCALE: Record<number, number> = {
  1: 0.62,
  2: 0.8,
  3: 1,
  4: 1.2,
  5: 1.42,
};

// Baseline per-finger size adjustment (independent of the length control): the thumb
// nail bed is naturally wider, the pinky nail bed is naturally smaller overall.
export const FINGER_WIDTH_SCALE: Record<FingerId, number> = {
  thumb: 1.22,
  index: 1,
  middle: 1,
  ring: 1,
  pinky: 0.72,
};

export const FINGER_HEIGHT_SCALE: Record<FingerId, number> = {
  thumb: 1,
  index: 1,
  middle: 1,
  ring: 1,
  pinky: 0.72,
};

export type NailShape =
  | "round"
  | "square"
  | "oval"
  | "almond"
  | "coffin"
  | "stiletto";

export type NailPattern =
  | "solid"
  | "french"
  | "gradient"
  | "glitter"
  | "dots"
  | "stripes"
  | "marble";

export interface ShapeDef {
  label: string;
  viewBox: string;
  path: string;
}

export const NAIL_SHAPES: Record<NailShape, ShapeDef> = {
  round: {
    label: "ラウンド",
    viewBox: "0 0 100 150",
    path: "M 22 150 C 8 150 8 55 22 35 C 32 15 68 15 78 35 C 92 55 92 150 78 150 Z",
  },
  square: {
    label: "スクエア",
    viewBox: "0 0 100 150",
    path: "M 18 150 L 18 42 C 18 28 27 21 38 21 L 62 21 C 73 21 82 28 82 42 L 82 150 Z",
  },
  oval: {
    label: "オーバル",
    viewBox: "0 0 100 150",
    path: "M 28 150 C 14 150 14 55 27 32 C 35 18 65 18 73 32 C 86 55 86 150 72 150 Z",
  },
  almond: {
    label: "アーモンド",
    viewBox: "0 0 100 150",
    path: "M 20 150 C 8 150 8 75 18 50 C 28 20 40 6 50 6 C 60 6 72 20 82 50 C 92 75 92 150 80 150 Z",
  },
  coffin: {
    label: "コフィン",
    viewBox: "0 0 100 150",
    path: "M 30 150 L 19 62 L 37 26 L 63 26 L 81 62 L 70 150 Z",
  },
  stiletto: {
    label: "スティレット",
    viewBox: "0 -25 100 175",
    path: "M 22 150 C 9 150 9 88 19 62 C 29 30 41 -2 50 -18 C 59 -2 71 30 81 62 C 91 88 91 150 78 150 Z",
  },
};

/**
 * Box size for one nail preview at a given neutral (length 3) height. Width is derived from
 * the shape's natural aspect ratio and stays fixed across length levels; only height scales,
 * so a longer nail reads as "grew taller" rather than "got wider". An optional finger applies
 * a baseline size adjustment (thumb wider, pinky smaller) on top of that.
 */
export function nailBoxSize(
  shape: NailShape,
  neutralHeight: number,
  length: number,
  finger?: FingerId
): { width: number; height: number } {
  const [, , vbW, vbH] = NAIL_SHAPES[shape].viewBox.split(" ").map(Number);
  const widthScale = finger ? FINGER_WIDTH_SCALE[finger] : 1;
  const heightScale = finger ? FINGER_HEIGHT_SCALE[finger] : 1;
  return {
    width: neutralHeight * (vbW / vbH) * widthScale,
    height: neutralHeight * (LENGTH_SCALE[length] ?? 1) * heightScale,
  };
}

export interface PatternDef {
  label: string;
  needsAccent: boolean;
}

export const NAIL_PATTERNS: Record<NailPattern, PatternDef> = {
  solid: { label: "ソリッド", needsAccent: false },
  french: { label: "フレンチ", needsAccent: true },
  gradient: { label: "グラデーション", needsAccent: true },
  glitter: { label: "グリッター", needsAccent: true },
  dots: { label: "ドット", needsAccent: true },
  stripes: { label: "ストライプ", needsAccent: true },
  marble: { label: "マーブル", needsAccent: true },
};

export interface NailDesign {
  shape: NailShape;
  baseColor: string;
  pattern: NailPattern;
  accentColor: string;
  length: number;
}

export interface DesignPreset extends NailDesign {
  id: string;
  name: string;
  tags: string[];
}

export const COLOR_SWATCHES: string[] = [
  "#E8C4A0",
  "#F5DFC8",
  "#C21E33",
  "#F7B8D0",
  "#FFD9E8",
  "#A9C4D8",
  "#E6D2B5",
  "#FFFFFF",
  "#222222",
  "#6B0F1A",
  "#FF7E5F",
  "#D8C7EC",
];

export const DEFAULT_DESIGN: NailDesign = {
  shape: "oval",
  baseColor: "#E8C4A0",
  pattern: "solid",
  accentColor: "#FFFFFF",
  length: 3,
};

export const PRESETS: DesignPreset[] = [
  {
    id: "simple-nude",
    name: "シンプルヌード",
    shape: "oval",
    baseColor: "#E8C4A0",
    pattern: "solid",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["オフィス", "シンプル"],
  },
  {
    id: "classic-french",
    name: "クラシックフレンチ",
    shape: "almond",
    baseColor: "#F5DFC8",
    pattern: "french",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["定番", "フォーマル"],
  },
  {
    id: "parisienne-red",
    name: "パリジェンヌレッド",
    shape: "square",
    baseColor: "#C21E33",
    pattern: "solid",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["赤", "モード"],
  },
  {
    id: "glitter-pink",
    name: "グリッターピンク",
    shape: "round",
    baseColor: "#F7B8D0",
    pattern: "glitter",
    accentColor: "#FFD9E8",
    length: 3,
    tags: ["キラキラ", "パーティー"],
  },
  {
    id: "mirror-gold",
    name: "ミラーゴールド",
    shape: "almond",
    baseColor: "#FFD700",
    pattern: "gradient",
    accentColor: "#FFF6C8",
    length: 3,
    tags: ["グラデ", "華やか"],
  },
  {
    id: "dot-blue",
    name: "くすみブルードット",
    shape: "oval",
    baseColor: "#A9C4D8",
    pattern: "dots",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["ドット", "カジュアル"],
  },
  {
    id: "marble-beige",
    name: "マーブルベージュ",
    shape: "coffin",
    baseColor: "#E6D2B5",
    pattern: "marble",
    accentColor: "#C79A6B",
    length: 3,
    tags: ["マーブル", "上品"],
  },
  {
    id: "stripe-mono",
    name: "ストライプモノトーン",
    shape: "square",
    baseColor: "#FFFFFF",
    pattern: "stripes",
    accentColor: "#222222",
    length: 3,
    tags: ["モノトーン", "モード"],
  },
  {
    id: "vampire-red",
    name: "ヴァンパイアレッド",
    shape: "stiletto",
    baseColor: "#6B0F1A",
    pattern: "solid",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["赤", "個性的"],
  },
  {
    id: "sunset-gradient",
    name: "サンセットグラデ",
    shape: "almond",
    baseColor: "#FF7E5F",
    pattern: "gradient",
    accentColor: "#FEB47B",
    length: 3,
    tags: ["グラデ", "夏"],
  },
  {
    id: "sheer-lavender",
    name: "シアーラベンダー",
    shape: "round",
    baseColor: "#D8C7EC",
    pattern: "solid",
    accentColor: "#FFFFFF",
    length: 3,
    tags: ["パステル", "春"],
  },
  {
    id: "milky-glitter",
    name: "ミルキーグリッター",
    shape: "oval",
    baseColor: "#FFFFFF",
    pattern: "glitter",
    accentColor: "#E0E0E0",
    length: 3,
    tags: ["キラキラ", "上品"],
  },
];

export const GLITTER_DOTS: { cx: number; cy: number; r: number; o: number }[] = [
  { cx: 30, cy: 130, r: 2.2, o: 0.9 },
  { cx: 45, cy: 110, r: 1.4, o: 0.7 },
  { cx: 60, cy: 135, r: 1.8, o: 0.85 },
  { cx: 70, cy: 95, r: 1.2, o: 0.6 },
  { cx: 35, cy: 80, r: 1.6, o: 0.75 },
  { cx: 55, cy: 65, r: 1.3, o: 0.65 },
  { cx: 25, cy: 105, r: 1.1, o: 0.55 },
  { cx: 65, cy: 120, r: 2, o: 0.8 },
  { cx: 48, cy: 88, r: 1.5, o: 0.7 },
  { cx: 40, cy: 145, r: 1.3, o: 0.6 },
  { cx: 75, cy: 140, r: 1.7, o: 0.75 },
  { cx: 52, cy: 45, r: 1, o: 0.5 },
  { cx: 62, cy: 55, r: 1.4, o: 0.65 },
  { cx: 32, cy: 55, r: 1.2, o: 0.55 },
];

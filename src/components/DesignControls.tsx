import {
  COLOR_SWATCHES,
  NAIL_PATTERNS,
  NAIL_SHAPES,
  NailDesign,
  NailPattern,
  NailShape,
  SKIN_TONES,
} from "@/lib/nail-designs";

interface DesignControlsProps {
  design: NailDesign;
  onChange: (patch: Partial<NailDesign>) => void;
}

export default function DesignControls({ design, onChange }: DesignControlsProps) {
  const patternDef = NAIL_PATTERNS[design.pattern];

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">形（シェイプ）</h3>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(NAIL_SHAPES) as NailShape[]).map((key) => (
            <button
              key={key}
              onClick={() => onChange({ shape: key })}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                design.shape === key
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"
              }`}
            >
              {NAIL_SHAPES[key].label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">ベースカラー</h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ baseColor: c })}
              className={`w-7 h-7 rounded-full border-2 ${
                design.baseColor.toLowerCase() === c.toLowerCase()
                  ? "border-pink-500 scale-110"
                  : "border-white"
              } shadow ring-1 ring-gray-200 transition-transform`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
        <input
          type="color"
          value={design.baseColor}
          onChange={(e) => onChange({ baseColor: e.target.value })}
          className="h-8 w-16 rounded cursor-pointer border border-gray-200"
        />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">パターン</h3>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(NAIL_PATTERNS) as NailPattern[]).map((key) => (
            <button
              key={key}
              onClick={() => onChange({ pattern: key })}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                design.pattern === key
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"
              }`}
            >
              {NAIL_PATTERNS[key].label}
            </button>
          ))}
        </div>
      </section>

      {patternDef.needsAccent && (
        <section>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">アクセントカラー</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from(new Set(["#FFFFFF", "#222222", ...COLOR_SWATCHES])).slice(0, 10).map((c) => (
              <button
                key={c}
                onClick={() => onChange({ accentColor: c })}
                className={`w-7 h-7 rounded-full border-2 ${
                  design.accentColor.toLowerCase() === c.toLowerCase()
                    ? "border-pink-500 scale-110"
                    : "border-white"
                } shadow ring-1 ring-gray-200 transition-transform`}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
          <input
            type="color"
            value={design.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
            className="h-8 w-16 rounded cursor-pointer border border-gray-200"
          />
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">肌の色（プレビュー用）</h3>
        <div className="flex gap-2">
          {SKIN_TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => onChange({ skinTone: t.id })}
              title={t.label}
              className={`w-8 h-8 rounded-full border-2 ${
                design.skinTone === t.id ? "border-pink-500 scale-110" : "border-white"
              } shadow ring-1 ring-gray-200 transition-transform`}
              style={{ backgroundColor: t.color }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

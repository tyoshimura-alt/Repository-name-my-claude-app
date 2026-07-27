import {
  COLOR_SWATCHES,
  PART_SHAPE_LABELS,
  PlacedPart,
  PartShape,
} from "@/lib/nail-designs";

type PlacementMode = "point" | "line" | "arc";

const PLACEMENT_MODE_LABELS: Record<PlacementMode, string> = {
  point: "点",
  line: "直線",
  arc: "アーチ",
};

interface PartsEditorProps {
  parts: PlacedPart[];
  pendingShape: PartShape;
  onPendingShapeChange: (shape: PartShape) => void;
  pendingColor: string;
  onPendingColorChange: (color: string) => void;
  selectedPartId: string | null;
  onSelectPart: (id: string | null) => void;
  onUpdatePart: (id: string, patch: Partial<PlacedPart>) => void;
  onDeletePart: (id: string) => void;
  placementMode: PlacementMode;
  onPlacementModeChange: (mode: PlacementMode) => void;
  lineStartPending: boolean;
}

export default function PartsEditor({
  parts,
  pendingShape,
  onPendingShapeChange,
  pendingColor,
  onPendingColorChange,
  selectedPartId,
  onSelectPart,
  onUpdatePart,
  onDeletePart,
  placementMode,
  onPlacementModeChange,
  lineStartPending,
}: PartsEditorProps) {
  const selectedPart = parts.find((p) => p.id === selectedPartId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">パーツ</h3>
        <p className="text-[11px] text-gray-400">
          {placementMode === "point"
            ? "爪をクリックして配置"
            : lineStartPending
              ? "終点をクリック"
              : "始点をクリック"}
        </p>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">配置方法</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PLACEMENT_MODE_LABELS) as PlacementMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onPlacementModeChange(mode)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                placementMode === mode
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"
              }`}
            >
              {PLACEMENT_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        {placementMode !== "point" && (
          <p className="text-[11px] text-gray-400 mt-1.5">
            {lineStartPending
              ? "続けて終点をクリックすると、その間にパーツが並びます。"
              : "始点と終点の2箇所をクリックすると、その間にパーツが並びます。"}
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">配置する形</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PART_SHAPE_LABELS) as PartShape[]).map((key) => (
            <button
              key={key}
              onClick={() => onPendingShapeChange(key)}
              className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                pendingShape === key
                  ? "border-pink-500 bg-pink-50 text-pink-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-pink-300"
              }`}
            >
              {PART_SHAPE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">配置する色</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onPendingColorChange(c)}
              className={`w-6 h-6 rounded-full border-2 ${
                pendingColor.toLowerCase() === c.toLowerCase()
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
          value={pendingColor}
          onChange={(e) => onPendingColorChange(e.target.value)}
          className="h-7 w-14 rounded cursor-pointer border border-gray-200"
        />
      </div>

      {parts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">配置済みパーツ（{parts.length}）</p>
          <div className="flex flex-wrap gap-1.5">
            {parts.map((p) => (
              <span
                key={p.id}
                onClick={() => onSelectPart(p.id)}
                className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full pl-2 pr-1 py-1 border cursor-pointer transition-colors ${
                  selectedPartId === p.id
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-300"
                  style={{ backgroundColor: p.color }}
                />
                {PART_SHAPE_LABELS[p.shape]}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePart(p.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="削除"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedPart && (
        <div className="rounded-lg border border-pink-200 bg-pink-50/50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-pink-700">
              選択中: {PART_SHAPE_LABELS[selectedPart.shape]}
            </p>
            <button
              onClick={() => onDeletePart(selectedPart.id)}
              className="text-[11px] font-medium text-red-500 hover:text-red-600"
            >
              このパーツを削除
            </button>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">角度（{selectedPart.rotation}°）</p>
            <input
              type="range"
              min={0}
              max={359}
              value={selectedPart.rotation}
              onChange={(e) => onUpdatePart(selectedPart.id, { rotation: Number(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">色</p>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => onUpdatePart(selectedPart.id, { color: c })}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedPart.color.toLowerCase() === c.toLowerCase()
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
              value={selectedPart.color}
              onChange={(e) => onUpdatePart(selectedPart.id, { color: e.target.value })}
              className="h-7 w-14 rounded cursor-pointer border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}

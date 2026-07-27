"use client";

import { useEffect, useState } from "react";
import {
  COLOR_SWATCHES,
  COORDINATED_PALETTES,
  DEFAULT_DESIGN,
  HANDS,
  NAIL_IDS,
  NAIL_PATTERNS,
  NAIL_SHAPES,
  NailDesign,
  NailId,
  NailPattern,
  NailShape,
  PRESETS,
  PlacedPart,
  PartShape,
  nailBoxSize,
  nailFinger,
  nailLabel,
} from "@/lib/nail-designs";
import NailGraphic from "@/components/NailGraphic";
import NailRow from "@/components/NailRow";
import DesignControls from "@/components/DesignControls";
import PartsEditor from "@/components/PartsEditor";
import Catalog from "@/components/Catalog";

const FAVORITES_KEY = "nail-app-favorites";

interface Favorite {
  id: string;
  name: string;
  savedAt: number;
  nails: Record<NailId, NailDesign>;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDesign(): NailDesign {
  const shapes = Object.keys(NAIL_SHAPES) as NailShape[];
  const patterns = Object.keys(NAIL_PATTERNS) as NailPattern[];
  const baseColor = randomFrom(COLOR_SWATCHES);
  let accentColor = randomFrom(COLOR_SWATCHES);
  if (accentColor === baseColor) {
    accentColor = baseColor === "#FFFFFF" ? "#222222" : "#FFFFFF";
  }
  return {
    shape: randomFrom(shapes),
    baseColor,
    pattern: randomFrom(patterns),
    accentColor,
    length: randomFrom([1, 2, 3, 4, 5]),
  };
}

type PlacementMode = "point" | "line" | "arc";

function pickDesign(d: NailDesign): NailDesign {
  return {
    shape: d.shape,
    baseColor: d.baseColor,
    pattern: d.pattern,
    accentColor: d.accentColor,
    length: d.length,
    parts: d.parts ?? [],
  };
}

export default function Home() {
  const [template, setTemplate] = useState<NailDesign>(DEFAULT_DESIGN);
  const [overrides, setOverrides] = useState<Partial<Record<NailId, NailDesign>>>({});
  const [activeNail, setActiveNail] = useState<NailId | "all">("all");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pendingPartShape, setPendingPartShape] = useState<PartShape>("heart");
  const [pendingPartColor, setPendingPartColor] = useState("#E85C8A");
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState<PlacementMode>("point");
  const [lineStartPoint, setLineStartPoint] = useState<{ x: number; y: number } | null>(null);

  function changePlacementMode(mode: PlacementMode) {
    setPlacementMode(mode);
    setLineStartPoint(null);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLineStartPoint(null);
  }, [activeNail]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      // one-time hydration from localStorage on mount; not a reactive sync
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites, loaded]);

  function effectiveDesign(id: NailId): NailDesign {
    return overrides[id] ?? template;
  }

  const nailDesigns = Object.fromEntries(
    NAIL_IDS.map((id) => [id, effectiveDesign(id)])
  ) as Record<NailId, NailDesign>;

  const displayedDesign = activeNail === "all" ? template : effectiveDesign(activeNail);

  function patchDesign(patch: Partial<NailDesign>) {
    if (activeNail === "all") {
      setTemplate((t) => ({ ...t, ...patch }));
      setOverrides({});
    } else {
      const id = activeNail;
      setOverrides((o) => ({ ...o, [id]: { ...effectiveDesign(id), ...patch } }));
    }
  }

  function addPart(x: number, y: number) {
    const newPart: PlacedPart = {
      id: `part-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      shape: pendingPartShape,
      x,
      y,
      rotation: 0,
      color: pendingPartColor,
    };
    patchDesign({ parts: [...(displayedDesign.parts ?? []), newPart] });
    setSelectedPartId(newPart.id);
  }

  function addPartsAlongLine(
    start: { x: number; y: number },
    end: { x: number; y: number },
    mode: PlacementMode
  ) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.hypot(dx, dy);
    const spacing = 0.12;
    const count = Math.min(10, Math.max(2, Math.round(dist / spacing) + 1));

    let ctrlX = 0;
    let ctrlY = 0;
    if (mode === "arc") {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const len = dist || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const bulge = 0.3 * dist;
      // Always bulge toward smaller y (visually "up") regardless of line direction.
      const candidateAY = midY + ny * bulge;
      const candidateBY = midY - ny * bulge;
      const useNegative = candidateBY < candidateAY;
      ctrlX = midX + (useNegative ? -nx : nx) * bulge;
      ctrlY = midY + (useNegative ? -ny : ny) * bulge;
    }

    const newParts: PlacedPart[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      let x: number;
      let y: number;
      let tangentX: number;
      let tangentY: number;
      if (mode === "arc") {
        x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * ctrlX + t ** 2 * end.x;
        y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * ctrlY + t ** 2 * end.y;
        tangentX = 2 * (1 - t) * (ctrlX - start.x) + 2 * t * (end.x - ctrlX);
        tangentY = 2 * (1 - t) * (ctrlY - start.y) + 2 * t * (end.y - ctrlY);
      } else {
        x = start.x + dx * t;
        y = start.y + dy * t;
        tangentX = dx;
        tangentY = dy;
      }
      const rotationDeg = (Math.atan2(tangentY, tangentX) * 180) / Math.PI;
      newParts.push({
        id: `part-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        shape: pendingPartShape,
        x,
        y,
        rotation: ((rotationDeg % 360) + 360) % 360,
        color: pendingPartColor,
      });
    }
    patchDesign({ parts: [...(displayedDesign.parts ?? []), ...newParts] });
  }

  function updatePart(id: string, patch: Partial<PlacedPart>) {
    patchDesign({
      parts: (displayedDesign.parts ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function deletePart(id: string) {
    patchDesign({ parts: (displayedDesign.parts ?? []).filter((p) => p.id !== id) });
    if (selectedPartId === id) setSelectedPartId(null);
  }

  function handleBigPreviewClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const fracX = (e.clientX - rect.left) / rect.width;
    const fracY = (e.clientY - rect.top) / rect.height;

    if (placementMode !== "point") {
      if (!lineStartPoint) {
        setLineStartPoint({ x: fracX, y: fracY });
      } else {
        addPartsAlongLine(lineStartPoint, { x: fracX, y: fracY }, placementMode);
        setLineStartPoint(null);
      }
      return;
    }

    const hit = (displayedDesign.parts ?? []).find(
      (p) => Math.hypot(p.x - fracX, p.y - fracY) < 0.06
    );
    if (hit) {
      setSelectedPartId(hit.id);
    } else {
      addPart(fracX, fracY);
    }
  }

  function applyDesign(d: NailDesign) {
    if (activeNail === "all") {
      setTemplate(pickDesign(d));
      setOverrides({});
    } else {
      setOverrides((o) => ({ ...o, [activeNail]: pickDesign(d) }));
    }
  }

  function shuffle() {
    if (activeNail === "all") {
      const shapes = Object.keys(NAIL_SHAPES) as NailShape[];
      const sharedShape = randomFrom(shapes);
      const next: Partial<Record<NailId, NailDesign>> = {};
      NAIL_IDS.forEach((id) => {
        next[id] = { ...randomDesign(), shape: sharedShape };
      });
      setOverrides(next);
      setTemplate(next.left_index!);
    } else {
      const id = activeNail;
      setOverrides((o) => ({ ...o, [id]: randomDesign() }));
    }
  }

  function coordinateShuffle() {
    const shapes = Object.keys(NAIL_SHAPES) as NailShape[];
    const patterns = Object.keys(NAIL_PATTERNS) as NailPattern[];
    const sharedShape = randomFrom(shapes);
    const palette = randomFrom(COORDINATED_PALETTES);
    const next: Partial<Record<NailId, NailDesign>> = {};
    NAIL_IDS.forEach((id) => {
      next[id] = {
        shape: sharedShape,
        baseColor: palette.base,
        pattern: randomFrom(patterns),
        accentColor: palette.accent,
        length: randomFrom([1, 2, 3, 4, 5]),
      };
    });
    setOverrides(next);
    setTemplate(next.left_index!);
    setActiveNail("all");
  }

  function resetAll() {
    setTemplate(DEFAULT_DESIGN);
    setOverrides({});
    setActiveNail("all");
  }

  function saveFavorite() {
    const name = `マイデザイン ${favorites.length + 1}`;
    const fav: Favorite = {
      id: `fav-${Date.now()}`,
      name,
      savedAt: Date.now(),
      nails: nailDesigns,
    };
    setFavorites((prev) => [fav, ...prev]);
  }

  function loadFavorite(fav: Favorite) {
    setOverrides(fav.nails);
    setTemplate(fav.nails.left_index);
    setActiveNail("all");
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  const bigBox = nailBoxSize(
    displayedDesign.shape,
    160,
    displayedDesign.length,
    activeNail === "all" ? undefined : nailFinger(activeNail)
  );
  const bigDef = NAIL_SHAPES[displayedDesign.shape];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white">
      <header className="bg-white/80 backdrop-blur border-b border-pink-100 px-4 py-4 sticky top-0 z-20">
        <h1 className="text-lg font-semibold text-gray-800">
          💅 ネイルデザイン シミュレーター
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          形・色・パターンを選んで、仕上がりをその場でチェック
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-10">
        {/* Preview + Controls */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-gray-700">プレビュー</h2>
              <div className="flex gap-2 flex-wrap justify-end">
                <button
                  onClick={shuffle}
                  className="text-xs font-medium rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                >
                  🎲 ランダム
                </button>
                <button
                  onClick={coordinateShuffle}
                  className="text-xs font-medium rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                >
                  🎨 コーディネート
                </button>
                <button
                  onClick={resetAll}
                  className="text-xs font-medium rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                >
                  リセット
                </button>
                <button
                  onClick={saveFavorite}
                  className="text-xs font-medium rounded-full bg-pink-600 text-white px-3 py-1.5 hover:bg-pink-700 whitespace-nowrap"
                >
                  ♥ 保存
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">編集する爪</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setActiveNail("all")}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                    activeNail === "all"
                      ? "bg-pink-600 border-pink-600 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  全部
                </button>
                {HANDS.map((hand) => (
                  <span key={hand} className="flex flex-wrap gap-1.5">
                    {NAIL_IDS.filter((id) => id.startsWith(`${hand}_`)).map((id) => (
                      <button
                        key={id}
                        onClick={() => setActiveNail(id)}
                        className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                          activeNail === id
                            ? "bg-pink-600 border-pink-600 text-white"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {nailLabel(id)}
                      </button>
                    ))}
                  </span>
                ))}
              </div>
              {activeNail === "all" && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  「全部」を選んでいる間は、変更するとすべての爪に反映されます。1本ずつ変えたいときは上のタブか、下のプレビューの爪を直接タップしてください。
                </p>
              )}
            </div>

            <NailRow
              nailDesigns={nailDesigns}
              activeNail={activeNail}
              onSelectNail={setActiveNail}
            />

            <div className="flex justify-center">
              <div style={{ width: bigBox.width, height: bigBox.height }} className="flex items-end">
                <svg
                  viewBox={bigDef.viewBox}
                  preserveAspectRatio="none"
                  width={bigBox.width}
                  height={bigBox.height}
                  className="drop-shadow cursor-crosshair"
                  onClick={handleBigPreviewClick}
                >
                  <NailGraphic uid="big-preview" {...displayedDesign} />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4 space-y-6">
            <DesignControls design={displayedDesign} onChange={patchDesign} />
            <PartsEditor
              parts={displayedDesign.parts ?? []}
              pendingShape={pendingPartShape}
              onPendingShapeChange={setPendingPartShape}
              pendingColor={pendingPartColor}
              onPendingColorChange={setPendingPartColor}
              selectedPartId={selectedPartId}
              onSelectPart={setSelectedPartId}
              onUpdatePart={updatePart}
              onDeletePart={deletePart}
              placementMode={placementMode}
              onPlacementModeChange={changePlacementMode}
              lineStartPending={lineStartPoint !== null}
            />
          </div>
        </section>

        {/* Catalog */}
        <Catalog title="デザインカタログ" items={PRESETS} onSelect={applyDesign} />

        {/* Favorites */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">お気に入り</h2>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-400">
              プレビューの「♥ 保存」ボタンで、気に入ったデザインをここに保存できます。
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="relative rounded-xl border border-gray-200 bg-white p-3 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => loadFavorite(fav)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 text-gray-400 hover:text-red-500 text-xs flex items-center justify-center shadow"
                    aria-label="削除"
                  >
                    ✕
                  </button>
                  <div className="space-y-1">
                    {HANDS.map((hand) => (
                      <div key={hand} className="h-10 flex items-center justify-center gap-1">
                        {NAIL_IDS.filter((id) => id.startsWith(`${hand}_`)).map((id) => {
                          const d = fav.nails[id];
                          const def = NAIL_SHAPES[d.shape];
                          const { width, height } = nailBoxSize(d.shape, 40, d.length, nailFinger(id));
                          return (
                            <svg
                              key={id}
                              viewBox={def.viewBox}
                              preserveAspectRatio="none"
                              width={width}
                              height={height}
                              className="self-end"
                            >
                              <NailGraphic uid={`fav-${fav.id}-${id}`} {...d} />
                            </svg>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-700 text-center truncate">
                    {fav.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

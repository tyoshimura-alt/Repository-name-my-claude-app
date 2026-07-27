"use client";

import { useEffect, useState } from "react";
import {
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
  nailBoxSize,
  nailLabel,
} from "@/lib/nail-designs";
import NailGraphic from "@/components/NailGraphic";
import NailRow from "@/components/NailRow";
import DesignControls from "@/components/DesignControls";
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
  const preset = randomFrom(PRESETS);
  return {
    shape: randomFrom(shapes),
    baseColor: preset.baseColor,
    pattern: randomFrom(patterns),
    accentColor: preset.accentColor,
    length: randomFrom([1, 2, 3, 4, 5]),
  };
}

function pickDesign(d: NailDesign): NailDesign {
  return {
    shape: d.shape,
    baseColor: d.baseColor,
    pattern: d.pattern,
    accentColor: d.accentColor,
    length: d.length,
  };
}

export default function Home() {
  const [template, setTemplate] = useState<NailDesign>(DEFAULT_DESIGN);
  const [overrides, setOverrides] = useState<Partial<Record<NailId, NailDesign>>>({});
  const [activeNail, setActiveNail] = useState<NailId | "all">("all");
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loaded, setLoaded] = useState(false);

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
      const next: Partial<Record<NailId, NailDesign>> = {};
      NAIL_IDS.forEach((id) => {
        next[id] = randomDesign();
      });
      setOverrides(next);
      setTemplate(next.left_index!);
    } else {
      const id = activeNail;
      setOverrides((o) => ({ ...o, [id]: randomDesign() }));
    }
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

  const bigBox = nailBoxSize(displayedDesign.shape, 160, displayedDesign.length);
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
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">プレビュー</h2>
              <div className="flex gap-2">
                <button
                  onClick={shuffle}
                  className="text-xs font-medium rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                >
                  🎲 ランダム
                </button>
                <button
                  onClick={resetAll}
                  className="text-xs font-medium rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 hover:bg-gray-50"
                >
                  リセット
                </button>
                <button
                  onClick={saveFavorite}
                  className="text-xs font-medium rounded-full bg-pink-600 text-white px-3 py-1.5 hover:bg-pink-700"
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
                  className="drop-shadow"
                >
                  <NailGraphic uid="big-preview" {...displayedDesign} />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4">
            <DesignControls design={displayedDesign} onChange={patchDesign} />
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
                          return (
                            <svg key={id} viewBox={def.viewBox} className="h-full">
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

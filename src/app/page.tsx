"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_DESIGN,
  FINGER_IDS,
  FINGER_LABELS,
  FingerId,
  NAIL_PATTERNS,
  NAIL_SHAPES,
  NailDesign,
  NailPattern,
  NailShape,
  PRESETS,
  SKIN_TONES,
} from "@/lib/nail-designs";
import NailGraphic from "@/components/NailGraphic";
import HandPreview from "@/components/HandPreview";
import DesignControls from "@/components/DesignControls";
import Catalog from "@/components/Catalog";

const FAVORITES_KEY = "nail-app-favorites";

interface Favorite {
  id: string;
  name: string;
  savedAt: number;
  fingers: Record<FingerId, NailDesign>;
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
    skinTone: randomFrom(SKIN_TONES).id,
  };
}

function pickDesign(d: NailDesign): NailDesign {
  return {
    shape: d.shape,
    baseColor: d.baseColor,
    pattern: d.pattern,
    accentColor: d.accentColor,
    skinTone: d.skinTone,
  };
}

export default function Home() {
  const [template, setTemplate] = useState<NailDesign>(DEFAULT_DESIGN);
  const [overrides, setOverrides] = useState<Partial<Record<FingerId, NailDesign>>>({});
  const [activeFinger, setActiveFinger] = useState<FingerId | "all">("all");
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

  function effectiveDesign(id: FingerId): NailDesign {
    return overrides[id] ?? template;
  }

  const fingerDesigns = Object.fromEntries(
    FINGER_IDS.map((id) => [id, effectiveDesign(id)])
  ) as Record<FingerId, NailDesign>;

  const displayedDesign = activeFinger === "all" ? template : effectiveDesign(activeFinger);

  function patchDesign(patch: Partial<NailDesign>) {
    if (activeFinger === "all") {
      setTemplate((t) => ({ ...t, ...patch }));
      setOverrides({});
    } else {
      const finger = activeFinger;
      setOverrides((o) => ({ ...o, [finger]: { ...effectiveDesign(finger), ...patch } }));
    }
  }

  function applyDesign(d: NailDesign) {
    if (activeFinger === "all") {
      setTemplate(pickDesign(d));
      setOverrides({});
    } else {
      setOverrides((o) => ({ ...o, [activeFinger]: pickDesign(d) }));
    }
  }

  function shuffle() {
    if (activeFinger === "all") {
      const next: Partial<Record<FingerId, NailDesign>> = {};
      FINGER_IDS.forEach((id) => {
        next[id] = randomDesign();
      });
      setOverrides(next);
      setTemplate(next.index!);
    } else {
      const finger = activeFinger;
      setOverrides((o) => ({ ...o, [finger]: randomDesign() }));
    }
  }

  function resetAll() {
    setTemplate(DEFAULT_DESIGN);
    setOverrides({});
    setActiveFinger("all");
  }

  function saveFavorite() {
    const name = `マイデザイン ${favorites.length + 1}`;
    const fav: Favorite = {
      id: `fav-${Date.now()}`,
      name,
      savedAt: Date.now(),
      fingers: fingerDesigns,
    };
    setFavorites((prev) => [fav, ...prev]);
  }

  function loadFavorite(fav: Favorite) {
    setOverrides(fav.fingers);
    setTemplate(fav.fingers.index);
    setActiveFinger("all");
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  const skinColor = SKIN_TONES.find((t) => t.id === displayedDesign.skinTone)?.color ?? "#e7bd94";
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
                  onClick={() => setActiveFinger("all")}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                    activeFinger === "all"
                      ? "bg-pink-600 border-pink-600 text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  全部
                </button>
                {FINGER_IDS.map((id) => (
                  <button
                    key={id}
                    onClick={() => setActiveFinger(id)}
                    className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
                      activeFinger === id
                        ? "bg-pink-600 border-pink-600 text-white"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {FINGER_LABELS[id]}
                  </button>
                ))}
              </div>
              {activeFinger === "all" && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  「全部」を選んでいる間は、変更するとすべての爪に反映されます。1本ずつ変えたいときは上のタブか、手のプレビューの爪を直接タップしてください。
                </p>
              )}
            </div>

            <div className="rounded-xl bg-gray-50">
              <HandPreview
                fingerDesigns={fingerDesigns}
                skinColor={skinColor}
                activeFinger={activeFinger}
                onSelectFinger={setActiveFinger}
              />
            </div>

            <div className="flex justify-center">
              <div className="w-28 h-40">
                <svg viewBox={bigDef.viewBox} className="w-full h-full drop-shadow">
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                  <div className="h-16 flex items-center justify-center gap-1">
                    {FINGER_IDS.map((id) => {
                      const d = fav.fingers[id];
                      const def = NAIL_SHAPES[d.shape];
                      return (
                        <svg key={id} viewBox={def.viewBox} className="h-full">
                          <NailGraphic uid={`fav-${fav.id}-${id}`} {...d} />
                        </svg>
                      );
                    })}
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

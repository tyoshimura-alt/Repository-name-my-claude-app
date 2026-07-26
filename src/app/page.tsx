"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_DESIGN,
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
import Catalog, { CatalogItem } from "@/components/Catalog";

const FAVORITES_KEY = "nail-app-favorites";

interface Favorite extends CatalogItem {
  savedAt: number;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Home() {
  const [design, setDesign] = useState<NailDesign>(DEFAULT_DESIGN);
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

  function patchDesign(patch: Partial<NailDesign>) {
    setDesign((d) => ({ ...d, ...patch }));
  }

  function applyDesign(d: NailDesign) {
    setDesign({
      shape: d.shape,
      baseColor: d.baseColor,
      pattern: d.pattern,
      accentColor: d.accentColor,
      skinTone: d.skinTone,
    });
  }

  function shuffle() {
    const shapes = Object.keys(NAIL_SHAPES) as NailShape[];
    const patterns = Object.keys(NAIL_PATTERNS) as NailPattern[];
    const preset = randomFrom(PRESETS);
    setDesign({
      shape: randomFrom(shapes),
      baseColor: preset.baseColor,
      pattern: randomFrom(patterns),
      accentColor: preset.accentColor,
      skinTone: randomFrom(SKIN_TONES).id,
    });
  }

  function saveFavorite() {
    const name = `マイデザイン ${favorites.length + 1}`;
    const fav: Favorite = {
      id: `fav-${Date.now()}`,
      name,
      savedAt: Date.now(),
      ...design,
    };
    setFavorites((prev) => [fav, ...prev]);
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  const skinColor = SKIN_TONES.find((t) => t.id === design.skinTone)?.color ?? "#e7bd94";
  const bigDef = NAIL_SHAPES[design.shape];

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
                  onClick={() => applyDesign(DEFAULT_DESIGN)}
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

            <div className="rounded-xl bg-gray-50">
              <HandPreview design={design} skinColor={skinColor} />
            </div>

            <div className="flex justify-center">
              <div className="w-28 h-40">
                <svg viewBox={bigDef.viewBox} className="w-full h-full drop-shadow">
                  <NailGraphic uid="big-preview" {...design} />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4">
            <DesignControls design={design} onChange={patchDesign} />
          </div>
        </section>

        {/* Catalog */}
        <Catalog title="デザインカタログ" items={PRESETS} onSelect={applyDesign} />

        {/* Favorites */}
        <Catalog
          title="お気に入り"
          items={favorites}
          onSelect={applyDesign}
          onRemove={removeFavorite}
          emptyMessage="プレビューの「♥ 保存」ボタンで、気に入ったデザインをここに保存できます。"
        />
      </main>
    </div>
  );
}

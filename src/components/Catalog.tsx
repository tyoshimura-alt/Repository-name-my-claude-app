import { NAIL_SHAPES, NailDesign } from "@/lib/nail-designs";
import NailGraphic from "./NailGraphic";

export interface CatalogItem extends NailDesign {
  id: string;
  name: string;
  tags?: string[];
}

interface CatalogProps {
  title: string;
  items: CatalogItem[];
  onSelect: (item: CatalogItem) => void;
  onRemove?: (id: string) => void;
  emptyMessage?: string;
}

export default function Catalog({
  title,
  items,
  onSelect,
  onRemove,
  emptyMessage,
}: CatalogProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-800 mb-3">{title}</h2>
      {items.length === 0 && emptyMessage && (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item) => {
          const def = NAIL_SHAPES[item.shape];
          return (
            <div
              key={item.id}
              className="relative rounded-xl border border-gray-200 bg-white p-3 hover:border-pink-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelect(item)}
            >
              {onRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 text-gray-400 hover:text-red-500 text-xs flex items-center justify-center shadow"
                  aria-label="削除"
                >
                  ✕
                </button>
              )}
              <div className="h-24 flex items-center justify-center">
                <svg viewBox={def.viewBox} className="h-full">
                  <NailGraphic uid={`cat-${item.id}`} {...item} />
                </svg>
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700 text-center truncate">
                {item.name}
              </p>
              {item.tags && (
                <div className="mt-1 flex flex-wrap justify-center gap-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] text-pink-600 bg-pink-50 rounded-full px-1.5 py-0.5"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

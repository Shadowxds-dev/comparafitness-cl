import { useEffect, useMemo, useState } from "react";
import { products, PRODUCT_TYPE_LABELS } from "../data/products";
import type { Product, ProductTier, ProductType } from "../types";
import { formatCLP } from "../utils/format";

const MAX_COMPARE = 4;
const TYPES: ProductType[] = ["pesas", "cardio", "accesorio", "wearable"];

const GRADIENTS: Record<ProductTier, string> = {
  economica: "from-sky-400 to-blue-600",
  media: "from-brand-400 to-brand-700",
  premium: "from-ink-700 to-ink-900",
  profesional: "from-orange-500 to-red-700",
};

const ICON_PATHS: Record<ProductType, string> = {
  pesas: "M8 26h4v12H8z M52 26h4v12h-4z M16 22h6v20h-6z M42 22h6v20h-6z M22 30h20v4H22z",
  cardio: "M10 46l8-14 6 8 6-16 8 12 6-6 6 4",
  accesorio: "M16 16h32v10H16z M20 26v22 M44 26v22 M20 48h24",
  wearable: "M22 14h20v36H22z M28 8h8v6h-8z M28 50h8v6h-8z M28 24h8v16h-8z",
};

function ThumbStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.min(1, Math.max(0, rating - i));
        return (
          <div key={i} className="relative h-3.5 w-3.5">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-ink-200" fill="currentColor">
              <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5Z" />
            </svg>
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-amber-400" fill="currentColor">
                <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.7l6.1-.6L10 1.5Z" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Comparator() {
  const [type, setType] = useState<ProductType>("pesas");
  const [selected, setSelected] = useState<string[]>([]);

  const productsOfType = useMemo(() => products.filter((p) => p.type === type), [type]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlType = params.get("type") as ProductType | null;
    if (urlType && TYPES.includes(urlType)) setType(urlType);
    const add = params.get("add");
    if (add) setSelected((prev) => (prev.includes(add) ? prev : [...prev, add].slice(0, MAX_COMPARE)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeType = (t: ProductType) => {
    setType(t);
    setSelected([]);
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

  const selectedProducts = useMemo(
    () => selected.map((id) => productsOfType.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [selected, productsOfType],
  );

  const specLabels = useMemo(() => {
    const seen: string[] = [];
    selectedProducts.forEach((p) =>
      p.specs.forEach((s) => {
        if (!seen.includes(s.label)) seen.push(s.label);
      }),
    );
    return seen;
  }, [selectedProducts]);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => changeType(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              type === t
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
            }`}
          >
            {PRODUCT_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {productsOfType.map((p) => {
          const isSelected = selected.includes(p.id);
          const disabled = !isSelected && selected.length >= MAX_COMPARE;
          return (
            <button
              key={p.id}
              disabled={disabled}
              onClick={() => toggle(p.id)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                isSelected
                  ? "border-brand-500 bg-brand-500 text-white"
                  : disabled
                    ? "cursor-not-allowed border-ink-100 bg-ink-50 text-ink-300"
                    : "border-ink-200 bg-white text-ink-600 hover:border-brand-300"
              }`}
            >
              {p.brand} {p.name}
            </button>
          );
        })}
      </div>

      {selectedProducts.length < 2 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-ink-200 py-16 text-center text-ink-400">
          Selecciona al menos 2 productos arriba para comparar.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 p-4 text-left text-ink-400"></th>
                {selectedProducts.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top">
                    <div className="relative mb-3 aspect-square w-24 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="h-full w-full object-contain p-1.5" loading="lazy" />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${GRADIENTS[p.tier]}`}>
                          <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-white/90" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d={ICON_PATHS[p.type]} strokeLinejoin="round" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-brand-600">{p.brand}</div>
                    <div className="text-base font-bold text-ink-900">{p.name}</div>
                    <div className="mt-1">
                      <ThumbStars rating={p.rating} />
                    </div>
                    <a
                      href={p.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer sponsored nofollow"
                      className="mt-3 inline-block rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                    >
                      Comprar en Mercado Libre
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-ink-50/60">
                <td className="p-4 font-medium text-ink-500">Precio</td>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="p-4 font-medium text-ink-900">
                    {formatCLP(p.price)}
                  </td>
                ))}
              </tr>
              {specLabels.map((label, i) => (
                <tr key={label} className={i % 2 === 0 ? "" : "bg-ink-50/60"}>
                  <td className="p-4 font-medium text-ink-500">{label}</td>
                  {selectedProducts.map((p) => (
                    <td key={p.id} className="p-4 font-medium text-ink-900">
                      {p.specs.find((s) => s.label === label)?.value ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

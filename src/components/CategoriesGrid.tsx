import React from "react";
import {
  Wrench,
  Zap,
  Wind,
  Hammer,
  Paintbrush,
  Cog,
  Grid as GridIcon,
  Tv,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { categories } from "../data/categories";
import { useMarketplace } from "../context/MarketplaceContext";

interface CategoriesGridProps {
  onSelectCategory: (catName: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Wrench: <Wrench className="w-6 h-6 text-blue-600" />,
  Zap: <Zap className="w-6 h-6 text-amber-500" />,
  Wind: <Wind className="w-6 h-6 text-cyan-600" />,
  Hammer: <Hammer className="w-6 h-6 text-amber-700" />,
  Paintbrush: <Paintbrush className="w-6 h-6 text-purple-600" />,
  Cog: <Cog className="w-6 h-6 text-emerald-600" />,
  Grid: <GridIcon className="w-6 h-6 text-rose-600" />,
  Tv: <Tv className="w-6 h-6 text-indigo-600" />,
};

export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ onSelectCategory }) => {
  const { selectedCategory, setSelectedCategory } = useMarketplace();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Vetted Campus Artisan Services
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse specialized skill categories verified with NIN/BVN background checks and transparent pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedCategory("All");
              onSelectCategory("All");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Show All Services
          </button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name;

          return (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                onSelectCategory(cat.name);
              }}
              className={`bg-white rounded-xl border p-5 transition duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? "border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20"
                  : "border-slate-200 hover:border-orange-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-105 transition">
                    {iconMap[cat.icon] || <Wrench className="w-6 h-6 text-slate-600" />}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Avg {cat.avgCost}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-orange-600 transition">
                  {cat.name}
                </h3>

                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  {cat.count} verified artisans online
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Popular Tasks:
                  </p>
                  {cat.popularServices.map((srv, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-slate-600 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs font-bold text-orange-600 pt-2 border-t border-slate-100">
                <span>View Available Jobs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

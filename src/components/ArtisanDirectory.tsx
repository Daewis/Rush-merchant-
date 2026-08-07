import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  Star,
  Building,
  CheckCircle2,
  Phone,
  MessageCircle,
  Briefcase,
  Search,
  Award,
} from "lucide-react";
import { ArtisanProfile } from "../types";
import { useMarketplace } from "../context/MarketplaceContext";

interface ArtisanDirectoryProps {
  onOpenPostJob: () => void;
  onOpenOnboarding: () => void;
}

export const ArtisanDirectory: React.FC<ArtisanDirectoryProps> = ({
  onOpenPostJob,
  onOpenOnboarding,
}) => {
  const { artisans, selectedHub, setSelectedHub } = useMarketplace();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesHub =
      selectedHub === "All Campus Hubs" || artisan.hub === selectedHub;
    const matchesCat =
      categoryFilter === "All" || artisan.category === categoryFilter;
    const matchesSearch =
      artisan.displayName.toLowerCase().includes(search.toLowerCase()) ||
      artisan.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()));

    return matchesHub && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Biometric Vetted Artisans Directory
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Every technician is pre-screened with NIN identity verification, BVN bank record checks, and physical campus residence proof.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition shrink-0"
        >
          Register as Verified Artisan
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, skill, or tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {["All", "Plumbing & Leak Repairs", "Electrical & Solar Power", "AC Servicing & Gas Refill", "Carpentry & Door Locksmith"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Artisans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredArtisans.map((artisan) => (
          <div
            key={artisan.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition space-y-4"
          >
            {/* Top Row Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={artisan.avatar}
                    alt={artisan.displayName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {artisan.displayName}
                    </h3>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200">
                      NIN / BVN
                    </span>
                  </div>
                  <p className="text-xs text-orange-600 font-bold mt-0.5">
                    {artisan.category}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-amber-500 justify-end">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-black text-xs text-slate-900">
                    {artisan.rating}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {artisan.jobsCompleted} jobs completed
                </p>
              </div>
            </div>

            {/* Bio & Skills */}
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {artisan.bio}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {artisan.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Hub Location & Rate */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-500">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">{artisan.hub}</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-slate-900">
                  ₦{artisan.hourlyRate.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400"> / hr</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={onOpenPostJob}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-orange-400" />
                <span>Hire Direct to Escrow</span>
              </button>

              <a
                href={`tel:${artisan.phone}`}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 transition flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

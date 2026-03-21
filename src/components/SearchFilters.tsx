"use client";

import { areas, amenities } from "@/data/listings";

type Filters = {
  search: string;
  area: string;
  minPrice: number;
  maxPrice: number;
  gender: string;
  roomType: string;
  amenities: string[];
  foodIncluded: boolean | null;
  acAvailable: boolean | null;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export default function SearchFilters({ filters, onChange }: Props) {
  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial });
  };

  const toggleAmenity = (a: string) => {
    const next = filters.amenities.includes(a)
      ? filters.amenities.filter((x) => x !== a)
      : [...filters.amenities, a];
    update({ amenities: next });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
      {/* Search */}
      <div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search PG name, area, landmark..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-gray-700"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
          />
        </div>
      </div>

      {/* Area + Price Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.area}
            onChange={(e) => update({ area: e.target.value })}
          >
            <option value="">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.minPrice}
            onChange={(e) => update({ minPrice: Number(e.target.value) })}
          >
            <option value={0}>No Min</option>
            <option value={5000}>₹5,000</option>
            <option value={7000}>₹7,000</option>
            <option value={8000}>₹8,000</option>
            <option value={10000}>₹10,000</option>
            <option value={12000}>₹12,000</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.maxPrice}
            onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          >
            <option value={50000}>No Max</option>
            <option value={7000}>₹7,000</option>
            <option value={8000}>₹8,000</option>
            <option value={10000}>₹10,000</option>
            <option value={12000}>₹12,000</option>
            <option value={15000}>₹15,000</option>
          </select>
        </div>
      </div>

      {/* Gender + Room Type */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.gender}
            onChange={(e) => update({ gender: e.target.value })}
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="coed">Co-ed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.roomType}
            onChange={(e) => update({ roomType: e.target.value })}
          >
            <option value="">Any</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Food</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.foodIncluded === null ? "" : filters.foodIncluded ? "yes" : "no"}
            onChange={(e) => update({ foodIncluded: e.target.value === "" ? null : e.target.value === "yes" })}
          >
            <option value="">Any</option>
            <option value="yes">Included</option>
            <option value="no">Not Included</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AC</label>
          <select
            className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-gray-700 bg-white"
            value={filters.acAvailable === null ? "" : filters.acAvailable ? "yes" : "no"}
            onChange={(e) => update({ acAvailable: e.target.value === "" ? null : e.target.value === "yes" })}
          >
            <option value="">Any</option>
            <option value="yes">AC Available</option>
            <option value="no">Non-AC</option>
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                filters.amenities.includes(a)
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

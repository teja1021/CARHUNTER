"use client";

import { Check, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

export const CarFilterControls = ({
  filters,
  currentFilters,
  onFilterChange,
  onClearFilter,
}) => {
  const { make, bodyType, fuelType, transmission, priceRange } = currentFilters;

  const filterSections = [
    {
      id: "make",
      title: "Make",
      options: filters.makes.map((make) => ({ value: make, label: make })),
      currentValue: make,
      onChange: (value) => onFilterChange("make", value),
    },
    {
      id: "bodyType",
      title: "Body Type",
      options: filters.bodyTypes.map((type) => ({ value: type, label: type })),
      currentValue: bodyType,
      onChange: (value) => onFilterChange("bodyType", value),
    },
    {
      id: "fuelType",
      title: "Fuel Type",
      options: filters.fuelTypes.map((type) => ({ value: type, label: type })),
      currentValue: fuelType,
      onChange: (value) => onFilterChange("fuelType", value),
    },
    {
      id: "transmission",
      title: "Transmission",
      options: filters.transmissions.map((type) => ({
        value: type,
        label: type,
      })),
      currentValue: transmission,
      onChange: (value) => onFilterChange("transmission", value),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4 bg-muted-30 border border-black rounded-lg p-4 shadow-sm">
        <h3 className="font-bold text-white text-base mb-1">Price Range</h3>
        <div className="px-2">
          <Slider
            min={filters.priceRange.min}
            max={filters.priceRange.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => onFilterChange("priceRange", value)}
            className="bg-gray-400/20 h-2 rounded-full relative [&_[role=slider]]:bg-white [&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:shadow-lg after:content-[''] after:absolute after:top-0 after:left-0 after:h-full after:bg-black after:rounded-full after:z-0"

          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="font-extrabold text-sm text-black  bg-gray-100 px-3 py-1 rounded">
            ${priceRange[0]}
          </div>
          <div className="font-extrabold text-sm text-black  bg-gray-100 px-3 py-1 rounded">
            ${priceRange[1]}
          </div>
        </div>
      </div>

      {/* Filter Categories */}
      {filterSections.map((section) => (
        <div key={section.id} className="space-y-3">
          <h4 className="text-sm font-semibold text-black flex justify-between items-center">
            <span>{section.title}</span>
            {section.currentValue && (
              <button
                className="text-xs text-gray-500 hover:underline flex items-center"
                onClick={() => onClearFilter(section.id)}
              >
                <X className="mr-1 h-3 w-3" />
                Clear
              </button>
            )}
          </h4>
          <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {section.options.map((option) => (
              <Badge
                key={option.value}
                variant={
                  section.currentValue === option.value ? "default" : "outline"
                }
                className={`cursor-pointer px-3 py-1 transition ${
                  section.currentValue === option.value
                    ? "bg-muted-30 hover:bg-emerald-600 text-white border-emerald-500"
                    : "bg-gray-500 hover:bg-gray-200 text-gray-900"
                }`}
                onClick={() => {
                  section.onChange(
                    section.currentValue === option.value ? "" : option.value
                  );
                }}
              >
                {option.label}
                {section.currentValue === option.value && (
                  <Check className="ml-1 h-3 w-3 inline" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

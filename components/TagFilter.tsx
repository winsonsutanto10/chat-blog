"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface TagFilterProps {
  tags: { name: string; count: number }[];
  activeTag: string | null;
}

const MAX_VISIBLE = 5;

export default function TagFilter({ tags, activeTag }: TagFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const visibleTags = tags.slice(0, MAX_VISIBLE);
  const overflowTags = tags.slice(MAX_VISIBLE);
  const activeIsOverflow = activeTag && overflowTags.some((t) => t.name === activeTag);

  function navigate(tag: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tag) params.set("tag", tag);
    else params.delete("tag");
    router.push(`/?${params.toString()}`);
    setDropdownOpen(false);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const chipClass = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? "bg-[#FB5607] text-white shadow-sm shadow-[#FB5607]/30"
        : "bg-white text-[#38200D]/60 border border-[#38200D]/10 hover:border-[#FB5607]/40 hover:text-[#FB5607]"
    }`;

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* All */}
      <button onClick={() => navigate(null)} className={chipClass(!activeTag)}>
        All
      </button>

      {/* Visible tag chips */}
      {visibleTags.map((tag) => (
        <button
          key={tag.name}
          onClick={() => navigate(tag.name)}
          className={chipClass(activeTag === tag.name)}
        >
          {tag.name}
          <span className={`ml-1 text-[10px] font-bold ${activeTag === tag.name ? "opacity-70" : "opacity-40"}`}>
            {tag.count}
          </span>
        </button>
      ))}

      {/* Overflow dropdown */}
      {overflowTags.length > 0 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={chipClass(!!activeIsOverflow)}
          >
            {activeIsOverflow ? activeTag : `+${overflowTags.length} more`}
            <svg
              className={`inline ml-1 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#38200D]/10 rounded-2xl shadow-xl shadow-[#38200D]/10 py-1.5 z-30">
              <p className="px-3 py-1.5 text-[10px] font-semibold text-[#38200D]/40 uppercase tracking-wider">
                All Tags
              </p>
              <div className="max-h-64 overflow-y-auto">
                {tags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => navigate(tag.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                      activeTag === tag.name
                        ? "text-[#FB5607] font-semibold bg-[#FB5607]/5"
                        : "text-[#38200D]/70 hover:bg-[#FFF8F2] hover:text-[#38200D]"
                    }`}
                  >
                    {tag.name}
                    <span className="text-xs font-bold text-[#38200D]/30">{tag.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

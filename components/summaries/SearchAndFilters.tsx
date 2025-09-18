"use client";

import { useState, useRef, useEffect } from "react";

interface SearchAndFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  showUserOnly: boolean;
  onShowUserOnlyChange: (showUserOnly: boolean) => void;
  sortBy:
    | "created_at"
    | "updated_at"
    | "upload_date"
    | "last_edited_at"
    | "name";
  onSortByChange: (
    sortBy:
      | "created_at"
      | "updated_at"
      | "upload_date"
      | "last_edited_at"
      | "name"
  ) => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  showUserFilter?: boolean;
  isUserAuthenticated?: boolean;
}

const SearchAndFilters = ({
  search,
  onSearchChange,
  showUserOnly,
  onShowUserOnlyChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  showUserFilter = true,
  isUserAuthenticated = false,
}: SearchAndFiltersProps) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Bar with Sort and Filter Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="חפש סיכומים..."
              className="w-full pl-3 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            />
          </div>
          {/* Sort Options */}
          {/* Sort Button */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="מיון"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-4 space-y-4">
                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      מיון לפי
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        onSortByChange(
                          e.target.value as
                            | "created_at"
                            | "updated_at"
                            | "upload_date"
                            | "last_edited_at"
                            | "name"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="created_at">תאריך יצירה</option>
                      <option value="updated_at">תאריך עדכון</option>
                      <option value="upload_date">תאריך העלאה</option>
                      <option value="last_edited_at">נערך לאחרונה</option>
                      <option value="name">שם</option>
                    </select>
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סדר מיון
                    </label>
                    <select
                      value={sortOrder}
                      onChange={(e) =>
                        onSortOrderChange(e.target.value as "asc" | "desc")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">חדש לישן</option>
                      <option value="asc">ישן לחדש</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="סינון"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                />
              </svg>
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <div className="p-4">
                  {/* User Filter */}
                  {showUserFilter && isUserAuthenticated && (
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showUserOnly}
                          onChange={(e) =>
                            onShowUserOnlyChange(e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          הצג רק את הסיכומים שלי
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchAndFilters;

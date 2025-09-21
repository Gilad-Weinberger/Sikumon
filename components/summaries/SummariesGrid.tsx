"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useCachedSummaries } from "../../lib/hooks/useCachedSummaries";
import SearchAndFilters from "./SearchAndFilters";
import SummaryCard from "./SummaryCard";
import { useAuth } from "../../lib/contexts/AuthContext";

interface SummariesGridProps {
  title?: string;
  showCreateButton?: boolean;
  userIdFilter?: string; // If provided, only show summaries from this user
  showAuthor?: boolean;
  limit?: number;
  showPagination?: boolean;
  showUserFilter?: boolean;
}

const SummariesGrid = ({
  title,
  showCreateButton = true,
  userIdFilter,
  showAuthor = true,
  limit = 12,
  showPagination = true,
  showUserFilter = true,
}: SummariesGridProps) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUserOnly, setShowUserOnly] = useState(!!userIdFilter);
  const [sortBy, setSortBy] = useState<
    "created_at" | "updated_at" | "upload_date" | "last_edited_at" | "name"
  >("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Memoize the query filters to prevent unnecessary re-renders
  const queryFilters = useMemo(
    () => ({
      page: currentPage,
      limit,
      search: search || undefined,
      user_id: userIdFilter || (showUserOnly && user ? user.id : undefined),
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
    [
      currentPage,
      limit,
      search,
      userIdFilter,
      showUserOnly,
      user,
      sortBy,
      sortOrder,
    ]
  );

  // Use the cached query hook
  const {
    data: queryResult,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useCachedSummaries(queryFilters);

  // Extract data from query result
  const summaries = queryResult?.summaries || [];
  const totalPages = queryResult?.pagination.totalPages || 1;
  const error = queryError ? "כשלון בטעינת סיכומים" : null;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, showUserOnly, sortBy, sortOrder]);

  const renderPaginationButton = (page: number, isActive: boolean) => (
    <button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
    >
      {page}
    </button>
  );

  const renderPagination = () => {
    if (!showPagination || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisiblePages / 2)
    );
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
        >
          → הקודם
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(renderPaginationButton(i, i === currentPage));
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-md text-sm font-medium transition-colors"
        >
          הבא ←
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">{pages}</div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      {title && (
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {showCreateButton && user && (
            <Link
              href="/summaries/upload"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
              title="העלה סיכום חדש"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        showUserOnly={showUserOnly}
        onShowUserOnlyChange={setShowUserOnly}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        showUserFilter={showUserFilter && !userIdFilter}
        isUserAuthenticated={!!user}
      />

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען סיכומים...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
          <div className="text-red-800">{error}</div>
          <button
            onClick={() => refetch()}
            className="mt-2 text-red-600 hover:text-red-700 underline"
          >
            נסה שנית
          </button>
        </div>
      ) : summaries.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            לא נמצאו סיכומים
          </h3>
          <p className="mt-2 text-gray-500">
            {search || showUserOnly
              ? "נסה לשנות את החיפוש או הסינון"
              : "עדיין לא הועלו סיכומים"}
          </p>
          {user && !showUserOnly && showCreateButton && (
            <Link
              href="/summaries/upload"
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              העלה את הסיכום הראשון
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Summaries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {summaries.map((summary) => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                showAuthor={showAuthor}
              />
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default SummariesGrid;

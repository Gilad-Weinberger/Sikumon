"use client";

import Link from "next/link";
import { SummaryWithUser } from "../../lib/types/db-schema";

interface SummaryCardProps {
  summary: SummaryWithUser;
  showAuthor?: boolean;
}

const SummaryCard = ({ summary, showAuthor = true }: SummaryCardProps) => {
  return (
    <Link href={`/summaries/${summary.id}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 p-6 h-full border border-gray-200 hover:border-blue-300">
        {/* Main Content */}
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
              {summary.name}
            </h3>
            {summary.description && (
              <p className="text-sm text-gray-600 line-clamp-4 mb-4">
                {summary.description}
              </p>
            )}
          </div>

          {/* Author at bottom */}
          {showAuthor && (
            <div className="flex items-center text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
              {/* User Circle Icon */}
              <div className="flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full ml-2 flex-shrink-0">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-medium truncate">
                {summary.user?.full_name || "לא ידוע"}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SummaryCard;

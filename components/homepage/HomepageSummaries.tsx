"use client";

import Link from "next/link";
import SummariesGrid from "../summaries/SummariesGrid";
import { useAuth } from "../../lib/contexts/AuthContext";

const HomepageSummaries = () => {
  const { user } = useAuth();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            סיכומים אחרונים
          </h2>
          {user && (
            <Link
              href="/summaries/upload"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg
                className="w-5 h-5"
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
              הוסף סיכום חדש
            </Link>
          )}
        </div>

        <SummariesGrid
          showCreateButton={false}
          showAuthor={true}
          limit={12}
          showPagination={true}
          showUserFilter={true}
        />
      </div>
    </section>
  );
};

export default HomepageSummaries;

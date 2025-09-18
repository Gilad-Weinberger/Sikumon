"use client";

import Link from "next/link";
import SummariesGrid from "../summaries/SummariesGrid";

interface UserSummariesSectionProps {
  userId: string;
}

const UserSummariesSection = ({ userId }: UserSummariesSectionProps) => {
  return (
    <div className="relative bg-white rounded-xl shadow-sm p-6">
      {/* Header with title and plus button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">הסיכומים שלי</h2>
        <Link
          href="/summaries/upload"
          className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
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
      </div>

      <SummariesGrid
        showCreateButton={false}
        userIdFilter={userId}
        showAuthor={true}
        limit={12}
        showPagination={true}
        showUserFilter={true}
      />
    </div>
  );
};

export default UserSummariesSection;

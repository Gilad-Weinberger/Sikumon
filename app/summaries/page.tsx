"use client";

import SummariesGrid from "../../components/summaries/SummariesGrid";

export default function SummariesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">כל הסיכומים</h1>
          <p className="text-gray-600 mt-2">
            עיין וחפש בכל הסיכומים הזמינים
          </p>
        </div>
        
        <SummariesGrid
          showCreateButton={true}
          showAuthor={true}
          limit={12}
          showPagination={true}
          showUserFilter={true}
        />
      </div>
    </div>
  );
}
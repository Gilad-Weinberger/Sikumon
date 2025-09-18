"use client";

import SummariesGrid from "../summaries/SummariesGrid";

const HomepageSummaries = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            סיכומים אחרונים
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            גלה את הסיכומים האחרונים שהועלו על ידי הקהילה שלנו
          </p>
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

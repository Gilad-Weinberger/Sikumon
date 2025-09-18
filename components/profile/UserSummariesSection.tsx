"use client";

import SummariesGrid from "../summaries/SummariesGrid";

interface UserSummariesSectionProps {
  userId: string;
}

const UserSummariesSection = ({ userId }: UserSummariesSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
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

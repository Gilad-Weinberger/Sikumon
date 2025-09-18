"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/contexts/AuthContext";
import UserDetailCard from "../../components/profile/UserDetailCard";
import UserSummariesSection from "../../components/profile/UserSummariesSection";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* User Details - Left Column (narrow) in RTL */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <UserDetailCard user={user} />
          </div>

          {/* User Summaries - Right Column (wide) in RTL */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <UserSummariesSection userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
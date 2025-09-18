"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/contexts/AuthContext";
import { signOut } from "../../lib/functions/authFunctions";

interface ProfileCardProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
  };
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      await signOut();
      await refreshUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "לא ידוע";
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">מידע פרופיל</h2>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xl font-bold">
            {user.email?.charAt(0).toUpperCase() || "מ"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            כתובת אימייל
          </label>
          <p className="text-gray-900 text-lg text-left">
            {user.email || "לא סופק אימייל"}
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            מזהה משתמש
          </label>
          <p className="text-gray-600 font-mono text-sm break-all text-left">
            {user.id}
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            חבר מאז
          </label>
          <p className="text-gray-900">{formatDate(user.created_at)}</p>
        </div>
      </div>

      <div className="mt-8 flex space-x-reverse space-x-4">
        <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          ערוך פרופיל
        </button>

        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "מתנתק..." : "יציאה"}
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

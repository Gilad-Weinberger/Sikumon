"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/contexts/AuthContext";
import { signOut } from "../../lib/functions/authFunctions";
import { GradeLevel } from "../../lib/types/db-schema";
import EditProfileModal from "./EditProfileModal";

interface UserDetailCardProps {
  user: {
    id: string;
    email?: string;
    created_at?: string;
    full_name?: string | null;
    grade?: GradeLevel | null;
  };
}

const UserDetailCard = ({ user }: UserDetailCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
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

  const getTimeBasedGreeting = () => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 6 && hour < 12) {
      return "בוקר טוב";
    } else if (hour >= 12 && hour < 17) {
      return "צהריים טובים";
    } else if (hour >= 17 && hour < 20) {
      return "אחר צהריים טובים";
    } else if (hour >= 20 || hour < 2) {
      return "ערב טוב";
    } else {
      return "לילה טוב";
    }
  };

  const handleUserUpdate = (updatedFields: {
    full_name?: string | null;
    grade?: GradeLevel | null;
  }) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedFields,
    }));
    // Also refresh the auth context to update the global user state
    refreshUser();
  };

  const getGradeDisplay = (grade?: GradeLevel | null) => {
    if (!grade) return "לא נבחר";

    const gradeMap: Record<GradeLevel, string> = {
      A: "א",
      B: "ב",
      C: "ג",
      D: "ד",
      E: "ה",
      F: "ו",
      G: "ז",
    };

    return `שיעור ${gradeMap[grade]}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">
            {currentUser.full_name?.charAt(0).toUpperCase() ||
              currentUser.email?.charAt(0).toUpperCase() ||
              "מ"}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {getTimeBasedGreeting()}, {currentUser.full_name || "משתמש"}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            כתובת אימייל
          </label>
          <p className="text-gray-900 text-left text-sm break-all">
            {currentUser.email || "לא סופק אימייל"}
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            מזהה משתמש
          </label>
          <p className="text-gray-600 font-mono text-xs break-all text-left">
            {currentUser.id}
          </p>
        </div>

        <div className="pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            חבר מאז
          </label>
          <p className="text-gray-900 text-sm">
            {formatDate(currentUser.created_at)}
          </p>
        </div>

        <div className="border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שיעור
          </label>
          <p className="text-gray-900 text-sm">
            {getGradeDisplay(currentUser.grade)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          ערוך פרופיל
        </button>

        <button
          onClick={handleSignOut}
          disabled={isLoading}
          className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "מתנתק..." : "יציאה"}
        </button>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default UserDetailCard;

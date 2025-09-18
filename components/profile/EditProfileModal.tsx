"use client";

import { useState, useEffect } from "react";
import { GradeLevel } from "../../lib/types/db-schema";
import { updateDbUser } from "../../lib/functions/userFunctions";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    full_name?: string | null;
    grade?: GradeLevel | null;
  };
  onUserUpdate: (updatedUser: {
    full_name?: string | null;
    grade?: GradeLevel | null;
  }) => void;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: EditProfileModalProps) => {
  const [fullName, setFullName] = useState(user.full_name || "");
  const [grade, setGrade] = useState(user.grade || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(user.full_name || "");
      setGrade(user.grade || "");
      setError("");
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!fullName.trim()) {
      setError("השם המלא הוא שדה חובה");
      setIsLoading(false);
      return;
    }

    if (!grade) {
      setError("בחירת שיעור היא חובה");
      setIsLoading(false);
      return;
    }

    try {
      const updatedUser = await updateDbUser(user.id, {
        full_name: fullName.trim(),
        grade: grade as GradeLevel,
      });

      if (!updatedUser) {
        throw new Error("כשלון בעדכון הפרופיל");
      }

      onUserUpdate({
        full_name: updatedUser.full_name,
        grade: updatedUser.grade,
      });

      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err instanceof Error ? err.message : "אירעה שגיאה בעדכון הפרופיל"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      dir="rtl"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">עריכת פרופיל</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              שם מלא
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900 placeholder:text-gray-500"
              placeholder="הזן את השם המלא שלך"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              שיעור
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right text-gray-900"
              disabled={isLoading}
            >
              <option value="">בחר שיעור</option>
              <option value="A">שיעור א</option>
              <option value="B">שיעור ב</option>
              <option value="C">שיעור ג</option>
              <option value="D">שיעור ד</option>
              <option value="E">שיעור ה</option>
              <option value="F">שיעור ו</option>
              <option value="G">שיעור ז</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "שומר..." : "שמור שינויים"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

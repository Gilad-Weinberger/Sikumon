"use client";

import { useState } from "react";
import { useAuth } from "../../lib/contexts/AuthContext";
import { signUp } from "../../lib/functions/authFunctions";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [grade, setGrade] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

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

    if (password !== confirmPassword) {
      setError("הסיסמאות לא תואמות");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      setIsLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName, grade);
      await refreshUser();
      setMessage("החשבון נוצר בהצלחה! אנא בדוק את האימייל שלך לאימות.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setGrade("");
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "אירעה שגיאה במהלך ההרשמה"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        הרשמה
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            disabled={isLoading}
          >
            <option value="">בחר שיעור</option>
            <option value="A">א</option>
            <option value="B">ב</option>
            <option value="C">ג</option>
            <option value="D">ד</option>
            <option value="E">ה</option>
            <option value="F">ו</option>
            <option value="G">ז</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            אימייל
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
            placeholder="הזן את האימייל שלך"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
            placeholder="הזן סיסמה (לפחות 6 תווים)"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            אימות סיסמה
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
            placeholder="אמת את הסיסמה שלך"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "יוצר חשבון..." : "הרשמה"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          יש לך כבר חשבון?{" "}
          <a href="/auth/signin" className="text-blue-600 hover:text-blue-800">
            התחבר כאן
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpForm;

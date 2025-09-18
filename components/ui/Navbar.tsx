"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/contexts/AuthContext";
import { signOut } from "../../lib/functions/authFunctions";

const Navbar = () => {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      await refreshUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center space-x-reverse space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              סיכומון
            </Link>
          </div>

          <div className="flex items-center space-x-reverse space-x-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-reverse space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
                  title="פרופיל"
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-colors"
                  title="יציאה"
                >
                  <svg
                    className="w-5 h-5 rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-reverse space-x-4">
                <Link
                  href="/auth/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  הרשמה
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  כניסה
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

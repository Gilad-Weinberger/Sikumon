"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/contexts/AuthContext";
import {
  useCachedSummary,
  useDeleteSummary,
} from "../../../lib/hooks/useCachedSummaries";
import FileGrid from "../../../components/summaries/FileGrid";
import { formatDate } from "./functions";

interface SummaryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SummaryDetailPage({ params }: SummaryDetailPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  // Use cached summary hook
  const {
    data: summary,
    isLoading: loading,
    error: queryError,
  } = useCachedSummary(resolvedParams.id);

  // Use delete mutation hook
  const deleteSummaryMutation = useDeleteSummary();

  const error = queryError ? "כשלון בטעינת סיכום" : null;
  const deleting = deleteSummaryMutation.isPending;

  const handleDelete = async () => {
    if (!summary || !user) return;

    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך למחוק את הסיכום הזה? פעולה זו לא ניתנת לביטול."
    );

    if (!confirmed) return;

    try {
      await deleteSummaryMutation.mutateAsync(summary.id);
      router.push("/summaries");
    } catch (err) {
      console.error("Error deleting summary:", err);
    }
  };

  const isOwner = user && summary && user.id === summary.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען סיכום...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/summaries"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            חזרה לסיכומים
          </Link>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            סיכום לא נמצא
          </h1>
          <p className="text-gray-600 mb-4">הסיכום שאתה מחפש אינו קיים.</p>
          <Link
            href="/summaries"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            חזרה לסיכומים
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two Column Layout with different widths */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-112px)]">
          {/* Left Column - Details (1/4 width) - Fixed Height */}
          <div className="lg:col-span-1 h-full">
            {/* Header Section - Fixed height container */}
            <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {summary.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <span>מאת: {summary.user?.full_name || "לא ידוע"}</span>
                      <span>הועלה: {formatDate(summary.upload_date)}</span>
                      {summary.last_edited_at !== summary.created_at && (
                        <span>
                          נערך לאחרונה: {formatDate(summary.last_edited_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - scrollable middle section */}
              <div className="flex-1 overflow-auto">
                {summary.description && (
                  <div className="px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">
                      תיאור
                    </h2>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {summary.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Back Navigation - fixed at bottom */}
              <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <Link
                    href="/summaries"
                    className="text-blue-600 hover:text-blue-700 font-medium text-xl"
                    title="חזרה לסיכומים"
                  >
                    →
                  </Link>

                  {isOwner && (
                    <div className="flex space-x-reverse gap-3">
                      <Link
                        href={`/summaries/${summary.id}/edit`}
                        className="bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700 transition-colors"
                        title="ערוך"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        title={deleting ? "מוחק..." : "מחק"}
                      >
                        {deleting ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Files Grid (3/4 width) */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-medium text-gray-900">
                קבצים ({summary.file_urls.length})
              </h2>
            </div>

            <div className="p-6 flex-1 overflow-auto">
              <FileGrid fileUrls={summary.file_urls} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

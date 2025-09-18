"use client";

import React, { useState } from "react";

interface NativePDFViewerProps {
  url: string;
  filename: string;
  className?: string;
  mode?: "preview" | "full";
}

const NativePDFViewer = ({
  url,
  filename,
  className = "",
  mode = "full",
}: NativePDFViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Preview mode - show PDF icon
  if (mode === "preview") {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center p-4 bg-gray-50`}
      >
        <div className="text-6xl mb-2">📄</div>
        <p className="text-xs text-gray-600 text-center font-medium truncate max-w-full">
          {filename}
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF</p>
      </div>
    );
  }

  // Full mode - native PDF viewer using iframe
  return (
    <div className={`${className} flex flex-col h-full bg-gray-100`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-wrap gap-1 sm:gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">PDF</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-xs sm:text-sm"
            title="פתח בחלון חדש"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="hidden sm:inline">פתח בדפדפן</span>
          </a>
          <a
            href={url}
            download={filename}
            className="px-2 sm:px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-xs sm:text-sm"
            title="הורד קובץ"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="hidden sm:inline">הורד</span>
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">טוען PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center text-center p-4 sm:p-8">
              <div className="text-6xl sm:text-8xl mb-4">📄</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {filename}
              </h3>
              <p className="text-red-600 mb-6 text-sm sm:text-base">
                לא ניתן להציג את קובץ ה-PDF בדפדפן
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full max-w-sm">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  פתח בדפדפן
                </a>
                <a
                  href={url}
                  download={filename}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  הורד
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Native PDF viewer using iframe */}
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-full border-0"
          title={filename}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      </div>
    </div>
  );
};

export default NativePDFViewer;

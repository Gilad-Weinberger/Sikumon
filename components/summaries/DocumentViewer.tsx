"use client";

import {
  getDocumentSupport,
  getOnlineViewerUrls,
} from "../../lib/utils/documentParser";

interface DocumentViewerProps {
  url: string;
  filename: string;
  className?: string;
  mode?: "preview" | "full"; // preview for grid, full for modal
}

const DocumentViewer = ({
  url,
  filename,
  className = "",
  mode = "full",
}: DocumentViewerProps) => {
  const support = getDocumentSupport(filename);
  const viewerUrls = getOnlineViewerUrls(url);

  // Preview mode - show simple document icon
  if (mode === "preview") {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center p-4 bg-gray-50`}
      >
        <div className="text-6xl mb-2">📝</div>
        <p className="text-xs text-gray-600 text-center font-medium truncate max-w-full">
          {filename}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {support.isDoc
            ? "Word (.doc)"
            : support.isDocx
            ? "Word (.docx)"
            : "מסמך"}
        </p>
      </div>
    );
  }

  // Full mode - show action buttons only
  return (
    <div
      className={`${className} flex flex-col items-center justify-center p-12 min-w-[400px]`}
    >
      <div className="text-8xl mb-6">📝</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
        {filename}
      </h3>
      <p className="text-gray-600 mb-8">
        {support.isDoc
          ? "מסמך Word (.doc)"
          : support.isDocx
          ? "מסמך Word (.docx)"
          : "מסמך"}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.open(viewerUrls.microsoftOffice, "_blank")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 min-w-[200px] justify-center"
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
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          <span>פתח ב-Microsoft Office</span>
        </button>

        <a
          href={url}
          download
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 min-w-[200px] justify-center"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>הורד קובץ</span>
        </a>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center max-w-md">
        לחץ על &quot;פתח ב-Microsoft Office&quot; כדי לצפות במסמך בדפדפן או הורד
        את הקובץ לצפייה מקומית
      </p>
    </div>
  );
};

export default DocumentViewer;

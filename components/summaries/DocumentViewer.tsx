"use client";

import {
  getDocumentSupport,
  getOnlineViewerUrls,
} from "../../lib/utils/documentParser";
import PDFViewer from "./PDFViewer";
import NativePDFViewer from "./NativePDFViewer";

interface DocumentViewerProps {
  url: string;
  filename: string;
  className?: string;
  mode?: "preview" | "full"; // preview for grid, full for modal
  pdfViewerType?: "react-pdf" | "native"; // Choose PDF viewer type
}

const DocumentViewer = ({
  url,
  filename,
  className = "",
  mode = "full",
  pdfViewerType = "native",
}: DocumentViewerProps) => {
  const support = getDocumentSupport(filename);
  const viewerUrls = getOnlineViewerUrls(url);
  const isPDF = filename.toLowerCase().endsWith(".pdf");

  // Handle PDF files with specialized viewers
  if (isPDF) {
    if (pdfViewerType === "react-pdf") {
      return (
        <PDFViewer
          url={url}
          filename={filename}
          className={className}
          mode={mode}
        />
      );
    } else {
      return (
        <NativePDFViewer
          url={url}
          filename={filename}
          className={className}
          mode={mode}
        />
      );
    }
  }

  // Preview mode - show simple document icon for non-PDF documents
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

  // Full mode - show action buttons for non-PDF documents (Word, Excel, etc.)
  return (
    <div
      className={`${className} flex flex-col items-center justify-center p-6 sm:p-12 min-w-[300px] sm:min-w-[400px]`}
    >
      <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📝</div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center px-2">
        {filename}
      </h3>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        {support.isDoc
          ? "מסמך Word (.doc)"
          : support.isDocx
          ? "מסמך Word (.docx)"
          : "מסמך"}
      </p>

      <div className="flex flex-col gap-3 sm:gap-4">
        {/* First row: Two open buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => window.open(viewerUrls.microsoftOffice, "_blank")}
            className="bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center flex-1"
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

          <button
            onClick={() => window.open(viewerUrls.googleDocs, "_blank")}
            className="bg-red-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 justify-center flex-1"
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
            <span>פתח ב-Google Docs</span>
          </button>
        </div>

        {/* Second row: Download button */}
        <a
          href={url}
          download={filename}
          className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center w-full"
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
    </div>
  );
};

export default DocumentViewer;

"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  url: string;
  filename: string;
  className?: string;
  mode?: "preview" | "full";
}

const PDFViewer = ({
  url,
  filename,
  className = "",
  mode = "full",
}: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF loading error:", error);
    setError("שגיאה בטעינת קובץ ה-PDF");
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);
  };

  const goToNextPage = () => {
    setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);
  };

  const zoomIn = () => {
    setScale(Math.min(scale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(Math.max(scale - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Preview mode - show first page thumbnail
  if (mode === "preview") {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center p-4 bg-gray-50`}
      >
        <div className="relative">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-xs text-gray-600">טוען PDF...</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          {!error && (
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              className="max-w-full"
            >
              <Page
                pageNumber={1}
                scale={0.3}
                loading=""
                className="shadow-sm"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          )}
        </div>
        <p className="text-xs text-gray-600 text-center font-medium truncate max-w-full mt-2">
          {filename}
        </p>
        <p className="text-xs text-gray-500 mt-1">PDF</p>
      </div>
    );
  }

  // Full mode - complete PDF viewer
  return (
    <div className={`${className} flex flex-col h-full bg-gray-100`}>
      {/* Header with controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {filename}
          </h3>
          {!loading && !error && (
            <span className="text-sm text-gray-500">({numPages} עמודים)</span>
          )}
        </div>

        {!loading && !error && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border rounded-lg">
              <button
                onClick={zoomOut}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                title="הקטן"
                disabled={scale <= 0.5}
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
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <button
                onClick={resetZoom}
                className="px-3 py-1 text-sm hover:bg-gray-100 transition-colors min-w-[60px]"
                title="איפוס זום"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={zoomIn}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                title="הגדל"
                disabled={scale >= 3.0}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1 border rounded-lg">
              <button
                onClick={goToPrevPage}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                title="עמוד קודם"
                disabled={pageNumber <= 1}
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <span className="px-3 py-1 text-sm min-w-[80px] text-center">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
                title="עמוד הבא"
                disabled={pageNumber >= numPages}
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Download button */}
            <a
              href={url}
              download={filename}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              title="הורד קובץ"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              הורד
            </a>
          </div>
        )}
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex justify-center items-start p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">טוען קובץ PDF...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="text-8xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filename}
            </h3>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="flex gap-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                פתח בדפדפן
              </a>
              <a
                href={url}
                download={filename}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
                הורד
              </a>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading=""
                className="max-w-full"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;

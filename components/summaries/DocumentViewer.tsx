"use client";

import { useEffect, useState } from "react";
import {
  parseDocxFromUrl,
  getDocumentSupport,
  getOnlineViewerUrls,
  DocumentContent,
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
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerType, setViewerType] = useState<"content" | "iframe">("content");

  const support = getDocumentSupport(filename);
  const viewerUrls = getOnlineViewerUrls(url);

  useEffect(() => {
    const loadDocument = async () => {
      // For full mode, we don't need to load anything - just show action buttons
      if (mode === "full") {
        setLoading(false);
        return;
      }

      // Only load content for preview mode
      setLoading(true);
      setError(null);
      console.log("Loading document for preview:", { url, filename, support });

      try {
        if (support.isDocx && support.canParseContent) {
          console.log("Parsing DOCX for preview...");
          const parsedContent = await parseDocxFromUrl(url);
          console.log("Parsed content:", parsedContent);

          if (parsedContent.error) {
            console.error("Parsing error:", parsedContent.error);
            setError(parsedContent.error);
          } else {
            setContent(parsedContent);
            setViewerType("content");
          }
        } else {
          // For DOC files, we'll show fallback in preview
          setViewerType("iframe");
        }
      } catch (err) {
        console.error("Error loading document:", err);
        setError(err instanceof Error ? err.message : "שגיאה בטעינת המסמך");
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [url, filename, mode, support]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">טוען מסמך...</p>
        </div>
      </div>
    );
  }

  if (error && viewerType !== "iframe") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="text-center text-red-600 p-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">שגיאה בטעינת המסמך</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
          <button
            onClick={() => setViewerType("iframe")}
            className="mt-2 text-blue-600 underline text-xs hover:text-blue-700"
          >
            נסה עם צופה חיצוני
          </button>
        </div>
      </div>
    );
  }

  // Preview mode - show content preview or thumbnail
  if (mode === "preview") {
    console.log("Preview mode - content:", content, "viewerType:", viewerType);

    if (viewerType === "content" && content && !content.error && content.html) {
      // Extract text content and limit it
      const textContent = content.text || content.html.replace(/<[^>]*>/g, "");
      const previewText =
        textContent.substring(0, 200) + (textContent.length > 200 ? "..." : "");

      return (
        <div className={`${className} overflow-hidden p-2`}>
          <div className="text-xs leading-relaxed text-gray-700 line-clamp-6">
            {previewText}
          </div>
        </div>
      );
    } else {
      // Show loading or error state for preview
      if (loading) {
        return (
          <div
            className={`${className} flex items-center justify-center bg-gray-50`}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-1"></div>
              <p className="text-xs text-gray-600">טוען...</p>
            </div>
          </div>
        );
      }

      // Fallback for preview mode
      return (
        <div
          className={`${className} flex items-center justify-center bg-gray-50`}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-xs text-gray-600">מסמך Word</p>
            {error && <p className="text-xs text-red-500 mt-1">שגיאה בטעינה</p>}
          </div>
        </div>
      );
    }
  }

  // Full mode - show action buttons only
  if (mode === "full") {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center p-12 min-w-[400px]`}
      >
        <div className="text-8xl mb-6">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
          {filename}
        </h3>
        <p className="text-gray-600 mb-8">
          {support.isDoc ? "מסמך Word (.doc)" : "מסמך Word (.docx)"}
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
          לחץ על &quot;פתח ב-Microsoft Office&quot; כדי לצפות במסמך בדפדפן או
          הורד את הקובץ לצפייה מקומית
        </p>
      </div>
    );
  }
};

export default DocumentViewer;

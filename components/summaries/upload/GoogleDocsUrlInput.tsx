"use client";

import { useState } from "react";

interface GoogleDocsUrlInputProps {
  onAddUrl: (url: string, title: string) => void;
  disabled?: boolean;
}

const GoogleDocsUrlInput = ({
  onAddUrl,
  disabled = false,
}: GoogleDocsUrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isValidGoogleDocsUrl = (url: string): boolean => {
    const googleDocsPattern =
      /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9-_]+/;
    return googleDocsPattern.test(url);
  };

  const extractTitleFromUrl = (url: string): string => {
    // Try to extract a meaningful title from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const docId = pathParts[pathParts.indexOf("d") + 1];
    return docId
      ? `Google Docs - ${docId.substring(0, 8)}...`
      : "Google Docs Document";
  };

  const handleAddUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);

    if (!url.trim()) {
      setError("יש להזין קישור");
      return;
    }

    if (!isValidGoogleDocsUrl(url.trim())) {
      setError("יש להזין קישור תקין של Google Docs");
      return;
    }

    const finalTitle = extractTitleFromUrl(url.trim());
    onAddUrl(url.trim(), finalTitle);

    // Reset form
    setUrl("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAddUrl(e as unknown as React.MouseEvent);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-900">
        הוספת קישור Google Docs
      </h4>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="google-docs-url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            קישור Google Docs *
          </label>
          <input
            type="url"
            id="google-docs-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://docs.google.com/document/d/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-500"
            disabled={disabled}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="button"
          onClick={handleAddUrl}
          disabled={disabled || !url.trim()}
          className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          הוסף קישור
        </button>
      </div>

      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <p className="font-medium mb-1">הוראות:</p>
        <ul className="space-y-1">
          <li>
            • הדבק קישור של מסמך Google Docs, Google Sheets או Google Slides
          </li>
          <li>• וודא שהמסמך זמין לצפייה ציבורית או לכל מי שיש לו את הקישור</li>
          <li>• כותרת המסמך תיווצר אוטומטית מהקישור</li>
        </ul>
      </div>
    </div>
  );
};

export default GoogleDocsUrlInput;

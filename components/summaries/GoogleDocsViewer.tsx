"use client";

import { getGoogleDocsEmbedUrl } from "@/lib/utils/documentParser";

interface GoogleDocsViewerProps {
  url: string;
  filename: string;
  mode?: "preview" | "full";
  className?: string;
}

const GoogleDocsViewer = ({
  url,
  filename,
  mode = "full",
  className = "",
}: GoogleDocsViewerProps) => {
  const embedUrl = getGoogleDocsEmbedUrl(url);

  if (mode === "preview") {
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={filename}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="bg-gray-100 px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-lg">📄</span>
          <span className="text-sm font-medium text-gray-900 truncate">
            {filename}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
        >
          פתח ב-Google Docs
        </a>
      </div>

      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        title={filename}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default GoogleDocsViewer;

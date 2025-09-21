"use client";

interface UrlItem {
  url: string;
  title: string;
}

interface UrlListProps {
  urls: UrlItem[];
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const UrlList = ({ urls, onRemove, disabled = false }: UrlListProps) => {
  if (urls.length === 0) return null;

  const getDocumentIcon = (url: string) => {
    if (url.includes("/document/")) return "📄";
    if (url.includes("/spreadsheets/")) return "📊";
    if (url.includes("/presentation/")) return "📑";
    return "🔗";
  };

  const getDocumentType = (url: string) => {
    if (url.includes("/document/")) return "Google Docs";
    if (url.includes("/spreadsheets/")) return "Google Sheets";
    if (url.includes("/presentation/")) return "Google Slides";
    return "Google Docs";
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">
        קישורים שנוספו ({urls.length})
      </h4>

      <div className="space-y-2">
        {urls.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
              <div className="text-2xl">{getDocumentIcon(item.url)}</div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900 truncate"
                  title={item.title}
                >
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">
                  {getDocumentType(item.url)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 p-1"
                title="פתח בטאב חדש"
                onClick={(e) => e.stopPropagation()}
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
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              <button
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 disabled:opacity-50 p-1"
                title="הסר"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrlList;

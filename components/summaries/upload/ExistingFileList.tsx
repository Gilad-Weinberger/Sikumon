"use client";

import { getFileInfo } from "@/lib/utils/documentParser";

interface ExistingFile {
  url: string;
  name: string;
}

interface ExistingFileListProps {
  files: ExistingFile[];
  onRemove: (index: number) => void;
  disabled?: boolean;
  title?: string;
}

const ExistingFileList = ({
  files,
  onRemove,
  disabled = false,
  title = "קבצים קיימים",
}: ExistingFileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {files.map((file, index) => {
          const fileInfo = getFileInfo(file.url);
          return (
            <div
              key={index}
              className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200"
            >
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="text-2xl">{fileInfo.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {fileInfo.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    קובץ קיים • {fileInfo.type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExistingFileList;

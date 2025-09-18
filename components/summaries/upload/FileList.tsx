"use client";

import Image from "next/image";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileListProps {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
  uploading?: boolean;
  uploadProgress?: { [key: string]: number };
  title?: string;
  className?: string;
}

const FileList = ({
  files,
  onRemove,
  uploading = false,
  uploadProgress = {},
  title = "קבצים שנבחרו",
  className = "bg-gray-50",
}: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={index}
            className={`flex items-center justify-between ${className} p-3 rounded-md`}
          >
            <div className="flex items-center space-x-reverse space-x-3">
              {file.preview && (
                <Image
                  src={file.preview}
                  alt=""
                  className="h-8 w-8 object-cover rounded"
                  height={32}
                  width={32}
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-reverse space-x-3">
              {uploading && uploadProgress[file.name] !== undefined && (
                <div className="w-20">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress[file.name]}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={uploading}
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;

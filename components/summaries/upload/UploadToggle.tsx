"use client";

import { useState } from "react";
import FileUploadArea from "./FileUploadArea";
import FileList from "./FileList";
import GoogleDocsUrlInput from "./GoogleDocsUrlInput";
import UrlList from "./UrlList";

interface FileWithPreview extends File {
  preview?: string;
}

interface UrlItem {
  url: string;
  title: string;
}

interface UploadToggleProps {
  // File upload props
  files: FileWithPreview[];
  handleFiles: (fileList: FileList) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  uploadProgress: { [key: string]: number };

  // URL props
  urls: UrlItem[];
  onAddUrl: (url: string, title: string) => void;
  onRemoveUrl: (index: number) => void;

  // Common props
  disabled?: boolean;
}

type UploadMode = "files" | "urls";

const UploadToggle = ({
  files,
  handleFiles,
  dragActive,
  handleDrag,
  handleDrop,
  onRemoveFile,
  uploadProgress,
  urls,
  onAddUrl,
  onRemoveUrl,
  disabled = false,
}: UploadToggleProps) => {
  const [activeMode, setActiveMode] = useState<UploadMode>("files");

  return (
    <div className="space-y-4">
      {/* Toggle Bar */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setActiveMode("files")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeMode === "files"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          disabled={disabled}
        >
          📁 העלאת קבצים
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("urls")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeMode === "urls"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
          disabled={disabled}
        >
          🔗 קישור Google Docs
        </button>
      </div>

      {/* Content based on active mode */}
      <div className="space-y-4">
        {activeMode === "files" ? (
          <>
            <FileUploadArea
              handleFiles={handleFiles}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              disabled={disabled}
              title="העלאת קבצים"
              showTitle={false}
            />
            <FileList
              files={files}
              onRemove={onRemoveFile}
              uploading={disabled}
              uploadProgress={uploadProgress}
            />
          </>
        ) : (
          <>
            <GoogleDocsUrlInput onAddUrl={onAddUrl} disabled={disabled} />
            <UrlList urls={urls} onRemove={onRemoveUrl} disabled={disabled} />
          </>
        )}
      </div>

      {/* Summary of added content */}
      {(files.length > 0 || urls.length > 0) && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>סה״כ נוסף:</span>
            <span className="font-medium">
              {files.length > 0 && `${files.length} קבצים`}
              {files.length > 0 && urls.length > 0 && " • "}
              {urls.length > 0 && `${urls.length} קישורים`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadToggle;

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import DocumentViewer from "./DocumentViewer";
import { getFileInfo } from "@/lib/utils/documentParser";

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: string[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

const FileModal = ({
  isOpen,
  onClose,
  files,
  currentIndex,
  onNavigate,
}: FileModalProps) => {
  const [imageError, setImageError] = useState(false);

  const currentFile = files[currentIndex];
  const fileInfo = currentFile ? getFileInfo(currentFile) : null;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          // Loop to first file if at last file, otherwise go to next
          onNavigate(currentIndex === files.length - 1 ? 0 : currentIndex + 1);
          break;
        case "ArrowLeft":
          // Loop to last file if at first file, otherwise go to previous
          onNavigate(currentIndex === 0 ? files.length - 1 : currentIndex - 1);
          break;
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, currentIndex, files.length, onNavigate, onClose]);

  // Reset image error when file changes
  useEffect(() => {
    setImageError(false);
  }, [currentIndex]);

  if (!isOpen || !fileInfo) return null;

  const goToPrevious = () => {
    // Loop to last file if at first file, otherwise go to previous
    const newIndex = currentIndex === 0 ? files.length - 1 : currentIndex - 1;
    onNavigate(newIndex);
  };

  const goToNext = () => {
    // Loop to first file if at last file, otherwise go to next
    const newIndex = currentIndex === files.length - 1 ? 0 : currentIndex + 1;
    onNavigate(newIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative max-w-[95vw] max-h-full w-full h-full flex items-center justify-center p-2 sm:p-4">
        {/* Navigation Arrows */}
        {files.length > 1 && (
          <>
            {/* Previous Arrow */}
            <button
              onClick={goToPrevious}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white bg-opacity-90 text-gray-700 shadow-lg hover:bg-opacity-100 hover:scale-110 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
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

            {/* Next Arrow */}
            <button
              onClick={goToNext}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white bg-opacity-90 text-gray-700 shadow-lg hover:bg-opacity-100 hover:scale-110 transition-all duration-200"
            >
              <svg
                className="w-6 h-6"
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
          </>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-2 rounded-full bg-white bg-opacity-90 text-gray-700 shadow-lg hover:bg-opacity-100 hover:scale-110 transition-all duration-200"
        >
          <svg
            className="w-6 h-6"
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

        {/* File Content */}
        <div className="bg-white rounded-lg shadow-2xl max-w-full sm:max-w-[85vw] max-h-full overflow-hidden mx-1 sm:mx-0 w-80 md:w-150">
          {fileInfo.isPDF ? (
            <div className="w-full h-[85vh] sm:h-[80vh] overflow-auto">
              <DocumentViewer
                url={currentFile}
                filename={fileInfo.filename}
                mode="full"
                className="w-full h-full"
                pdfViewerType="native"
              />
            </div>
          ) : fileInfo.isDocument ? (
            <div className="w-full max-h-[85vh] overflow-auto">
              <DocumentViewer
                url={currentFile}
                filename={fileInfo.filename}
                mode="full"
                className="w-full"
              />
            </div>
          ) : fileInfo.isImage && !imageError ? (
            <div className="relative">
              <Image
                src={currentFile}
                alt={fileInfo.filename}
                className="max-w-full max-h-[85vh] sm:max-h-[80vh] object-contain"
                height={800}
                width={800}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            /* Non-image file or error fallback */
            <div className="flex flex-col items-center justify-center p-6 sm:p-12 min-w-[300px] sm:min-w-[400px]">
              <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">{fileInfo.icon}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 text-center px-2">
                {fileInfo.filename}
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">{fileInfo.type}</p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm">
                <a
                  href={currentFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                  <span>פתח בטאב חדש</span>
                </a>
                <a
                  href={currentFile}
                  download={fileInfo.filename}
                  className="bg-gray-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
                  <span>הורד</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* File Info Bar */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg max-w-[90vw]">
          <span className="text-xs sm:text-sm truncate block">
            {currentIndex + 1} מתוך {files.length} - {fileInfo.filename}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileModal;

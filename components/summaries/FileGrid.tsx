"use client";

import Image from "next/image";
import { useState } from "react";
import FileModal from "./FileModal";
import DocumentViewer from "./DocumentViewer";
import { getFileInfo } from "../../lib/utils/documentParser";

// Using the shared getFileInfo function which returns the FileInfo type

interface FileGridProps {
  fileUrls: string[];
  className?: string;
}

const FileGrid = ({ fileUrls, className = "" }: FileGridProps) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const openModal = (index: number) => {
    setCurrentFileIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const navigateModal = (index: number) => {
    setCurrentFileIndex(index);
  };

  // Using the shared getFileInfo function from documentParser

  const handleImageError = (url: string) => {
    setImageErrors((prev) => new Set(prev).add(url));
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  const handleImageLoadStart = (url: string) => {
    setLoadingImages((prev) => new Set(prev).add(url));
  };

  const handleImageLoad = (url: string) => {
    setLoadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(url);
      return newSet;
    });
  };

  if (fileUrls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📁</div>
        <p className="text-gray-500">לא נמצאו קבצים</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}
    >
      {fileUrls.map((url, index) => {
        const fileInfo = getFileInfo(url);
        const hasImageError = imageErrors.has(url);
        const isLoading = loadingImages.has(url);

        return (
          <div
            key={index}
            className="group relative bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => openModal(index)}
          >
            {/* File Preview - Bigger */}
            <div className="aspect-[4/5] relative overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
              {fileInfo.isDocument ? (
                <div className="relative w-full h-full">
                  <DocumentViewer
                    url={url}
                    filename={fileInfo.filename}
                    mode="preview"
                    className="w-full h-full p-2"
                  />

                  {/* Hover Overlay for Documents */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                    {/* Action Buttons - Top Corners */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(index);
                      }}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="צפה"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <a
                      href={url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="הורד"
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
                    </a>
                  </div>

                  {/* File Info Overlay for Documents - Show on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 p-3">
                    <h3
                      className="text-xs font-medium text-white truncate"
                      title={fileInfo.filename}
                    >
                      {fileInfo.filename}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {fileInfo.type}
                    </p>
                  </div>
                </div>
              ) : fileInfo.isImage && !hasImageError ? (
                <div className="relative w-full h-full">
                  {/* Loading spinner */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  <Image
                    src={url}
                    alt={fileInfo.filename}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    onLoadStart={() => {
                      console.log("Image loading started:", url);
                      handleImageLoadStart(url);
                    }}
                    onError={(error) => {
                      console.error("Image loading error:", url, error);
                      handleImageError(url);
                    }}
                    onLoad={() => {
                      console.log("Image loaded successfully:", url);
                      handleImageLoad(url);
                    }}
                    priority={index < 4}
                  />

                  {/* Hover Overlay with darker background */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
                    {/* Action Buttons - Top Corners */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(index);
                      }}
                      className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="צפה"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                    <a
                      href={url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      title="הורד"
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
                    </a>
                  </div>

                  {/* File Info Overlay - Show on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 p-3">
                    <h3
                      className="text-xs font-medium text-white truncate"
                      title={fileInfo.filename}
                    >
                      {fileInfo.filename}
                    </h3>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {fileInfo.type}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3">{fileInfo.icon}</div>
                    <div className="text-xs text-gray-500 uppercase font-medium px-2">
                      {fileInfo.type.split(" ")[1] || fileInfo.type}
                    </div>
                  </div>

                  {/* Action Buttons for Non-Images - Top Corners */}
                  <button
                    onClick={() => openModal(index)}
                    className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    title="צפה"
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <a
                    href={url}
                    download
                    className="absolute top-2 left-2 bg-white bg-opacity-90 text-gray-700 p-2 rounded-full shadow-lg hover:shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    title="הורד"
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
                  </a>

                  {/* File Info Overlay for Non-Images - Show on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 p-2">
                    <h3
                      className="text-xs font-medium text-gray-900 truncate"
                      title={fileInfo.filename}
                    >
                      {fileInfo.filename}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {fileInfo.type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* File Modal */}
      <FileModal
        isOpen={modalOpen}
        onClose={closeModal}
        files={fileUrls}
        currentIndex={currentFileIndex}
        onNavigate={navigateModal}
      />
    </div>
  );
};

export default FileGrid;

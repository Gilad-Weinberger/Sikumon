"use client";

interface FileUploadAreaProps {
  handleFiles: (fileList: FileList) => void;
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  disabled?: boolean;
  title?: string;
  showTitle?: boolean;
}

const FileUploadArea = ({
  handleFiles,
  dragActive,
  handleDrag,
  handleDrop,
  disabled = false,
  title = "העלאת קבצים *",
  showTitle = true,
}: FileUploadAreaProps) => {
  const inputId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;

  const handleClick = () => {
    if (!disabled) {
      const fileInput = document.getElementById(inputId) as HTMLInputElement;
      fileInput?.click();
    }
  };

  return (
    <div>
      {showTitle && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {title}
        </label>
      )}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${
          disabled ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <span className="mt-2 block text-sm font-medium text-gray-900">
            גרור קבצים לכאן או לחץ להעלאה
          </span>
          <input
            id={inputId}
            name={inputId}
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            disabled={disabled}
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp"
          />
          <p className="mt-1 text-xs text-gray-500">
            PDF, Word (DOC/DOCX) ותמונות (JPEG, PNG, GIF, SVG, WebP) עד 50MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadArea;

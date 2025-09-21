"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/contexts/AuthContext";
import {
  SummaryDetailsForm,
  FileSection,
  UploadToggle,
  UploadLayout,
} from "../../../components/summaries/upload";
import {
  validateFile as validateFileUtil,
  handleFiles as handleFilesUtil,
  handleDrag as handleDragUtil,
  handleDrop as handleDropUtil,
  removeFile as removeFileUtil,
  handleSubmit as handleSubmitUtil,
} from "./functions";

interface FileWithPreview extends File {
  preview?: string;
}

interface UrlItem {
  url: string;
  title: string;
}

export default function UploadSummaryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    return validateFileUtil(file, setError);
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      handleFilesUtil(fileList, validateFile, setFiles, setError);
    },
    [validateFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    handleDragUtil(e, setDragActive);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      handleDropUtil(e, handleFiles, setDragActive);
    },
    [handleFiles]
  );

  const removeFile = (index: number) => {
    removeFileUtil(index, setFiles);
  };

  const addUrl = (url: string, title: string) => {
    setUrls((prev) => [...prev, { url, title }]);
    setError(null);
  };

  const removeUrl = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    await handleSubmitUtil(e, {
      user,
      formData,
      files,
      urls,
      setError,
      setUploading,
      setUploadProgress,
      router,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            נדרשת הזדהות
          </h1>
          <p className="text-gray-600 mb-4">
            עליך להיות מחובר כדי להעלות סיכומים.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            כניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <UploadLayout
      title="העלאת סיכום חדש"
      subtitle="שתף את חומרי הלימוד והסיכומים שלך עם הקהילה"
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitButtonText="העלה סיכום"
      submitButtonColor="blue"
      isSubmitting={uploading}
      isSubmitDisabled={
        uploading ||
        (files.length === 0 && urls.length === 0) ||
        !formData.name.trim()
      }
    >
      {/* Left Column - Summary Details */}
      <SummaryDetailsForm
        formData={formData}
        setFormData={setFormData}
        disabled={uploading}
      />

      {/* Right Column - Upload Toggle */}
      <FileSection>
        <UploadToggle
          files={files}
          onFilesChange={setFiles}
          handleFiles={handleFiles}
          dragActive={dragActive}
          handleDrag={handleDrag}
          handleDrop={handleDrop}
          onRemoveFile={removeFile}
          uploadProgress={uploadProgress}
          urls={urls}
          onAddUrl={addUrl}
          onRemoveUrl={removeUrl}
          disabled={uploading}
        />
      </FileSection>
    </UploadLayout>
  );
}

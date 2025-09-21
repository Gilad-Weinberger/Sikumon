"use client";

import { useState, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { SummaryWithUser } from "@/lib/types/db-schema";
import {
  SummaryDetailsForm,
  ExistingFileList,
  FileSection,
  UploadToggle,
  UploadLayout,
} from "@/components/summaries/upload";
import {
  fetchSummaryForEdit,
  validateFile as validateFileUtil,
  handleFiles as handleFilesUtil,
  handleDrag as handleDragUtil,
  handleDrop as handleDropUtil,
  removeNewFile as removeNewFileUtil,
  removeExistingFile as removeExistingFileUtil,
  handleSubmit as handleSubmitUtil,
} from "./functions";

interface FileWithPreview extends File {
  preview?: string;
}

interface ExistingFile {
  url: string;
  name: string;
}

interface UrlItem {
  url: string;
  title: string;
}

interface EditSummaryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditSummaryPage({ params }: EditSummaryPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);

  const [summary, setSummary] = useState<SummaryWithUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [newFiles, setNewFiles] = useState<FileWithPreview[]>([]);
  const [existingFiles, setExistingFiles] = useState<ExistingFile[]>([]);
  const [newUrls, setNewUrls] = useState<UrlItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Load existing summary data
  useEffect(() => {
    if (resolvedParams.id && user) {
      fetchSummaryForEdit(resolvedParams.id, user, {
        setLoading,
        setError,
        setSummary,
        setFormData,
        setExistingFiles,
      });
    }
  }, [resolvedParams.id, user]);

  const validateFile = useCallback((file: File): boolean => {
    return validateFileUtil(file, setError);
  }, []);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      handleFilesUtil(fileList, validateFile, setNewFiles, setError);
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

  const removeNewFile = (index: number) => {
    removeNewFileUtil(index, setNewFiles);
  };

  const removeExistingFile = (index: number) => {
    removeExistingFileUtil(index, setExistingFiles);
  };

  const addNewUrl = (url: string, title: string) => {
    setNewUrls((prev) => [...prev, { url, title }]);
    setError(null);
  };

  const removeNewUrl = (index: number) => {
    setNewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!summary) return;

    await handleSubmitUtil(e, {
      user,
      summary,
      formData,
      existingFiles,
      newFiles,
      newUrls,
      setError,
      setUploading,
      setUploadProgress,
    });

    router.push(`/summaries/${summary.id}`);
  };

  if (authLoading || loading) {
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
            עליך להיות מחובר כדי לערוך סיכומים.
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

  if (error && !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            חזרה
          </button>
        </div>
      </div>
    );
  }

  return (
    <UploadLayout
      title="עריכת סיכום"
      subtitle="ערוך את פרטי הסיכום וקבצי התוכן"
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      submitButtonText="עדכן סיכום"
      submitButtonColor="green"
      isSubmitting={uploading}
      isSubmitDisabled={
        uploading ||
        (existingFiles.length === 0 &&
          newFiles.length === 0 &&
          newUrls.length === 0) ||
        !formData.name.trim()
      }
    >
      {/* Left Column - Summary Details */}
      <SummaryDetailsForm
        formData={formData}
        setFormData={setFormData}
        disabled={uploading}
      />

      {/* Right Column - File Management */}
      <FileSection>
        <div className="space-y-6">
          <ExistingFileList
            files={existingFiles}
            onRemove={removeExistingFile}
            disabled={uploading}
          />

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              הוסף תוכן חדש
            </h3>
            <UploadToggle
              files={newFiles}
              handleFiles={handleFiles}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              onRemoveFile={removeNewFile}
              uploadProgress={uploadProgress}
              urls={newUrls}
              onAddUrl={addNewUrl}
              onRemoveUrl={removeNewUrl}
              disabled={uploading}
            />
          </div>
        </div>
      </FileSection>
    </UploadLayout>
  );
}

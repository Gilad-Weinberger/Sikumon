import {
  useCreateSummary,
  useUpdateSummary,
  useDeleteSummary,
} from "./useCachedSummaries";
import { uploadSummaryFile } from "../functions/summaryFunctions";
import { User, SummaryWithUser } from "../types/db-schema";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface FileWithPreview extends File {
  preview?: string;
}

interface UrlItem {
  url: string;
  title: string;
}

interface ExistingFile {
  url: string;
  name: string;
}

/**
 * Hook for handling summary creation with caching
 */
export const useSummaryCreation = () => {
  const createSummaryMutation = useCreateSummary();

  const createSummaryWithCache = async ({
    user,
    formData,
    files,
    urls,
    setError,
    setUploading,
    setUploadProgress,
    router,
  }: {
    user: User | null;
    formData: { name: string; description: string };
    files: FileWithPreview[];
    urls: UrlItem[];
    setError: (error: string | null) => void;
    setUploading: (uploading: boolean) => void;
    setUploadProgress: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >;
    router: AppRouterInstance;
  }) => {
    if (!user) {
      setError("עליך להיות מחובר כדי להעלות סיכומים");
      return;
    }

    if (!formData.name.trim()) {
      setError("נושא הסיכום הוא שדה חובה");
      return;
    }

    if (files.length === 0 && urls.length === 0) {
      setError("חובה להעלות לפחות קובץ אחד או להוסיף קישור");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload all files and collect URLs
      const allUrls: string[] = [];

      // Upload files to storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const fileUrl = await uploadSummaryFile(file, user.id);

        if (!fileUrl) {
          throw new Error(
            `כשלון בהעלאת קובץ: ${file.name}. אנא בדקו שהקובץ תקין ושהחיבור לאינטרנט יציב.`
          );
        }

        allUrls.push(fileUrl);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }

      // Add Google Docs URLs directly
      urls.forEach((urlItem) => {
        allUrls.push(urlItem.url);
      });

      // Create summary record using cached mutation
      const summary = await createSummaryMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        file_urls: allUrls,
      });

      if (!summary) {
        throw new Error("כשלון ביצירת רשומת סיכום");
      }

      // Cleanup preview URLs
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      // Redirect to summary detail
      router.push(`/summaries/${summary.id}`);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "כשלון בהעלאת סיכום");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return {
    createSummaryWithCache,
    isCreating: createSummaryMutation.isPending,
    createError: createSummaryMutation.error,
  };
};

/**
 * Hook for handling summary updates with caching
 */
export const useSummaryUpdate = () => {
  const updateSummaryMutation = useUpdateSummary();

  const updateSummaryWithCache = async ({
    user,
    summary,
    formData,
    existingFiles,
    newFiles,
    newUrls,
    setError,
    setUploading,
    setUploadProgress,
  }: {
    user: User | null;
    summary: SummaryWithUser;
    formData: { name: string; description: string };
    existingFiles: ExistingFile[];
    newFiles: FileWithPreview[];
    newUrls: UrlItem[];
    setError: (error: string | null) => void;
    setUploading: (uploading: boolean) => void;
    setUploadProgress: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >;
  }) => {
    if (!user || !summary) {
      setError("עליך להיות מחובר כדי לערוך סיכומים");
      return;
    }

    if (!formData.name.trim()) {
      setError("נושא הסיכום הוא שדה חובה");
      return;
    }

    if (
      existingFiles.length === 0 &&
      newFiles.length === 0 &&
      newUrls.length === 0
    ) {
      setError("חובה להשאיר או להוסיף לפחות קובץ אחד או קישור");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload new files
      const newFileUrls: string[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        const fileUrl = await uploadSummaryFile(file, user.id);

        if (!fileUrl) {
          throw new Error(`כשלון בהעלאת קובץ: ${file.name}`);
        }

        newFileUrls.push(fileUrl);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      }

      // Combine existing files, new uploaded files, and new URLs
      const allFileUrls = [
        ...existingFiles.map((f) => f.url),
        ...newFileUrls,
        ...newUrls.map((urlItem) => urlItem.url),
      ];

      // Update summary using cached mutation
      const updatedSummary = await updateSummaryMutation.mutateAsync({
        summaryId: summary.id,
        updates: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          file_urls: allFileUrls,
        },
      });

      if (!updatedSummary) {
        throw new Error("כשלון בעדכון הסיכום");
      }

      // Cleanup preview URLs
      newFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      return updatedSummary;
    } catch (error) {
      console.error("Update error:", error);
      setError(error instanceof Error ? error.message : "כשלון בעדכון הסיכום");
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  return {
    updateSummaryWithCache,
    isUpdating: updateSummaryMutation.isPending,
    updateError: updateSummaryMutation.error,
  };
};

/**
 * Hook for handling summary deletion with caching
 */
export const useSummaryDeletion = () => {
  const deleteSummaryMutation = useDeleteSummary();

  const deleteSummaryWithCache = async ({
    summary,
    user,
    router,
    setError,
  }: {
    summary: SummaryWithUser | null;
    user: User | null;
    router: AppRouterInstance;
    setError: (error: string | null) => void;
  }) => {
    if (!summary || !user) return;

    const confirmed = window.confirm(
      "האם אתה בטוח שברצונך למחוק את הסיכום הזה? פעולה זו לא ניתנת לביטול."
    );

    if (!confirmed) return;

    try {
      const success = await deleteSummaryMutation.mutateAsync(summary.id);

      if (success) {
        router.push("/profile");
      } else {
        setError("כשלון במחיקת סיכום");
      }
    } catch (err) {
      console.error("Error deleting summary:", err);
      setError(err instanceof Error ? err.message : "כשלון במחיקת סיכום");
    }
  };

  return {
    deleteSummaryWithCache,
    isDeleting: deleteSummaryMutation.isPending,
    deleteError: deleteSummaryMutation.error,
  };
};

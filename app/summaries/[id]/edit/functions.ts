import {
  getSummaryById,
  updateSummary,
  uploadSummaryFile,
} from "@/lib/functions/summaryFunctions";
import { SummaryWithUser, User } from "@/lib/types/db-schema";

interface FileWithPreview extends File {
  preview?: string;
}

interface ExistingFile {
  url: string;
  name: string;
}

// File validation constants
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword", // .doc files
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx files
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/svg+xml",
  "image/webp",
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Fetches summary data for editing
 */
export const fetchSummaryForEdit = async (
  summaryId: string,
  user: User | null,
  {
    setLoading,
    setError,
    setSummary,
    setFormData,
    setExistingFiles,
  }: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSummary: (summary: SummaryWithUser) => void;
    setFormData: React.Dispatch<
      React.SetStateAction<{ name: string; description: string }>
    >;
    setExistingFiles: React.Dispatch<React.SetStateAction<ExistingFile[]>>;
  }
) => {
  try {
    setLoading(true);
    setError(null);

    const fetchedSummary = await getSummaryById(summaryId);

    if (!fetchedSummary) {
      setError("סיכום לא נמצא");
      return;
    }

    // Check if user is the owner
    if (!user || fetchedSummary.user_id !== user.id) {
      setError("אין לך הרשאה לערוך סיכום זה");
      return;
    }

    setSummary(fetchedSummary);
    setFormData({
      name: fetchedSummary.name,
      description: fetchedSummary.description || "",
    });

    // Set existing files
    if (fetchedSummary.file_urls && fetchedSummary.file_urls.length > 0) {
      const existingFileList = fetchedSummary.file_urls.map((url) => ({
        url,
        name: url.split("/").pop() || "קובץ ללא שם",
      }));
      setExistingFiles(existingFileList);
    }
  } catch (err) {
    console.error("Error fetching summary:", err);
    setError(err instanceof Error ? err.message : "כשלון בטעינת סיכום");
  } finally {
    setLoading(false);
  }
};

/**
 * Validates a file for upload
 */
export const validateFile = (
  file: File,
  setError: (error: string | null) => void
): boolean => {
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_FILE_TYPES)[number]
    )
  ) {
    setError(
      `סוג קובץ ${file.type} אינו מורשה. נתמכים רק קבצי PDF, Word (DOC/DOCX) ותמונות.`
    );
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    setError(`קובץ ${file.name} גדול מדי. הגודל המקסימלי הוא 50MB`);
    return false;
  }

  return true;
};

/**
 * Handles new file selection and processing
 */
export const handleFiles = (
  fileList: FileList,
  validateFile: (file: File) => boolean,
  setNewFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  setError: (error: string | null) => void
) => {
  setError(null);
  const validFiles: FileWithPreview[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i] as FileWithPreview;
    if (validateFile(file)) {
      // Add preview for images
      if (file.type.startsWith("image/")) {
        file.preview = URL.createObjectURL(file);
      }
      validFiles.push(file);
    }
  }

  if (validFiles.length > 0) {
    setNewFiles((prev) => [...prev, ...validFiles]);
  }
};

/**
 * Handles drag events for file upload
 */
export const handleDrag = (
  e: React.DragEvent,
  setDragActive: (active: boolean) => void
) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

/**
 * Handles file drop events
 */
export const handleDrop = (
  e: React.DragEvent,
  handleFilesCallback: (fileList: FileList) => void,
  setDragActive: (active: boolean) => void
) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    handleFilesCallback(e.dataTransfer.files);
  }
};

/**
 * Removes a new file from the list and cleans up preview URLs
 */
export const removeNewFile = (
  index: number,
  setNewFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
) => {
  setNewFiles((prev) => {
    const files = [...prev];
    // Cleanup preview URL if it exists
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview!);
    }
    files.splice(index, 1);
    return files;
  });
};

/**
 * Removes an existing file from the list
 */
export const removeExistingFile = (
  index: number,
  setExistingFiles: React.Dispatch<React.SetStateAction<ExistingFile[]>>
) => {
  setExistingFiles((prev) => {
    const files = [...prev];
    files.splice(index, 1);
    return files;
  });
};

/**
 * Handles form submission for updating a summary
 */
export const handleSubmit = async (
  e: React.FormEvent,
  {
    user,
    summary,
    formData,
    existingFiles,
    newFiles,
    setError,
    setUploading,
    setUploadProgress,
  }: {
    user: User | null;
    summary: SummaryWithUser;
    formData: { name: string; description: string };
    existingFiles: ExistingFile[];
    newFiles: FileWithPreview[];
    setError: (error: string | null) => void;
    setUploading: (uploading: boolean) => void;
    setUploadProgress: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >;
  }
) => {
  e.preventDefault();

  if (!user || !summary) {
    setError("עליך להיות מחובר כדי לערוך סיכומים");
    return;
  }

  if (!formData.name.trim()) {
    setError("נושא הסיכום הוא שדה חובה");
    return;
  }

  if (existingFiles.length === 0 && newFiles.length === 0) {
    setError("חובה להשאיר או להוסיף לפחות קובץ אחד");
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

    // Combine existing and new file URLs
    const allFileUrls = [...existingFiles.map((f) => f.url), ...newFileUrls];

    // Update summary
    const updatedSummary = await updateSummary(summary.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      file_urls: allFileUrls,
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
  } catch (error) {
    console.error("Update error:", error);
    setError(error instanceof Error ? error.message : "כשלון בעדכון הסיכום");
  } finally {
    setUploading(false);
    setUploadProgress({});
  }
};

import {
  createSummary,
  uploadSummaryFile,
} from "../../../lib/functions/summaryFunctions";
import { User } from "../../../lib/types/db-schema";
import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

interface FileWithPreview extends File {
  preview?: string;
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
 * Handles file selection and processing
 */
export const handleFiles = (
  fileList: FileList,
  validateFile: (file: File) => boolean,
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>,
  setError: (error: string | null) => void
) => {
  setError(null);
  const newFiles: FileWithPreview[] = [];

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i] as FileWithPreview;
    if (validateFile(file)) {
      // Add preview for images
      if (file.type.startsWith("image/")) {
        file.preview = URL.createObjectURL(file);
      }
      newFiles.push(file);
    }
  }

  if (newFiles.length > 0) {
    setFiles((prev) => [...prev, ...newFiles]);
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
 * Removes a file from the list and cleans up preview URLs
 */
export const removeFile = (
  index: number,
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>
) => {
  setFiles((prev) => {
    const newFiles = [...prev];
    // Cleanup preview URL if it exists
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview!);
    }
    newFiles.splice(index, 1);
    return newFiles;
  });
};

/**
 * Handles form submission for creating a new summary
 */
export const handleSubmit = async (
  e: React.FormEvent,
  {
    user,
    formData,
    files,
    setError,
    setUploading,
    setUploadProgress,
    router,
  }: {
    user: User | null;
    formData: { name: string; description: string };
    files: FileWithPreview[];
    setError: (error: string | null) => void;
    setUploading: (uploading: boolean) => void;
    setUploadProgress: React.Dispatch<
      React.SetStateAction<{ [key: string]: number }>
    >;
    router: Router;
  }
) => {
  e.preventDefault();

  if (!user) {
    setError("עליך להיות מחובר כדי להעלות סיכומים");
    return;
  }

  if (!formData.name.trim()) {
    setError("נושא הסיכום הוא שדה חובה");
    return;
  }

  if (files.length === 0) {
    setError("חובה להעלות לפחות קובץ אחד");
    return;
  }

  setUploading(true);
  setError(null);

  try {
    // Upload all files
    const fileUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const fileUrl = await uploadSummaryFile(file, user.id);

      if (!fileUrl) {
        throw new Error(
          `כשלון בהעלאת קובץ: ${file.name}. אנא בדקו שהקובץ תקין ושהחיבור לאינטרנט יציב.`
        );
      }

      fileUrls.push(fileUrl);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
    }

    // Create summary record
    const summary = await createSummary({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      file_urls: fileUrls,
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

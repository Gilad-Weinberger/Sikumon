import {
  getSummaryById,
  deleteSummary,
} from "../../../lib/functions/summaryFunctions";

/**
 * Handles summary deletion with confirmation
 */
export const handleDelete = async (
  summary: any,
  user: any,
  {
    setDeleting,
    setError,
    router,
  }: {
    setDeleting: (deleting: boolean) => void;
    setError: (error: string | null) => void;
    router: any;
  }
) => {
  if (!summary || !user) return;

  const confirmed = window.confirm(
    "האם אתה בטוח שברצונך למחוק את הסיכום הזה? פעולה זו לא ניתנת לביטול."
  );

  if (!confirmed) return;

  try {
    setDeleting(true);

    const success = await deleteSummary(summary.id);

    if (success) {
      router.push("/summaries");
    } else {
      setError("כשלון במחיקת סיכום");
    }
  } catch (err) {
    console.error("Error deleting summary:", err);
    setError(err instanceof Error ? err.message : "כשלון במחיקת סיכום");
  } finally {
    setDeleting(false);
  }
};

/**
 * Formats a date string for display in dd/mm/yyyy hh:mm format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Gets file information including filename, type, and icon based on file extension
 */
export const getFileInfo = (url: string) => {
  const filename = url.split("/").pop() || "קובץ לא ידוע";
  const extension = url.split(".").pop()?.toLowerCase() || "";

  let type = "לא ידוע";
  let icon = "📁";

  switch (extension) {
    case "pdf":
      type = "מסמך PDF";
      icon = "📄";
      break;
    case "doc":
    case "docx":
      type = "מסמך Word";
      icon = "📝";
      break;
    case "jpg":
    case "jpeg":
      type = "תמונת JPEG";
      icon = "🖼️";
      break;
    case "png":
      type = "תמונת PNG";
      icon = "🖼️";
      break;
    case "gif":
      type = "תמונת GIF";
      icon = "🖼️";
      break;
    case "svg":
      type = "תמונת SVG";
      icon = "🖼️";
      break;
    case "webp":
      type = "תמונת WebP";
      icon = "🖼️";
      break;
  }

  return { filename, type, icon };
};

/**
 * Fetches summary data for the detail view
 */
export const fetchSummary = async (
  summaryId: string,
  {
    setLoading,
    setError,
    setSummary,
  }: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setSummary: (summary: any) => void;
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

    setSummary(fetchedSummary);
  } catch (err) {
    console.error("Error fetching summary:", err);
    setError(err instanceof Error ? err.message : "כשלון בטעינת סיכום");
  } finally {
    setLoading(false);
  }
};

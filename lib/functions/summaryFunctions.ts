import { Summary, SummaryWithUser } from "../types/db-schema";
import { createClient } from "../utils/supabase/client";

/**
 * Fetches a summary from the database by ID via API
 * @param summaryId - The summary's ID
 * @returns The summary with user data or null if not found
 */
export const getSummaryById = async (
  summaryId: string
): Promise<SummaryWithUser | null> => {
  try {
    const response = await fetch(`/api/summaries/${summaryId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error("Error fetching summary:", await response.text());
      return null;
    }

    const data = await response.json();
    const summary = data.summary as SummaryWithUser;

    // User data should now be included via optimized API - no fallback needed

    return summary;
  } catch (error) {
    console.error("Error in getSummaryById:", error);
    return null;
  }
};

/**
 * Creates a new summary via API
 * @param summaryData - The summary data to create
 * @returns The created summary or null if operation fails
 */
export const createSummary = async (summaryData: {
  name: string;
  description?: string;
  file_urls: string[];
}): Promise<Summary | null> => {
  try {
    const response = await fetch("/api/summaries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(summaryData),
    });

    if (!response.ok) {
      console.error("Error creating summary:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error in createSummary:", error);
    return null;
  }
};

/**
 * Updates a summary via API
 * @param summaryId - The summary's ID
 * @param updates - The fields to update
 * @returns The updated summary or null if operation fails
 */
export const updateSummary = async (
  summaryId: string,
  updates: {
    name?: string;
    description?: string;
    file_urls?: string[];
  }
): Promise<Summary | null> => {
  try {
    const response = await fetch(`/api/summaries/${summaryId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      console.error("Error updating summary:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error("Error in updateSummary:", error);
    return null;
  }
};

/**
 * Deletes a summary via API
 * @param summaryId - The summary's ID
 * @returns True if deletion was successful, false otherwise
 */
export const deleteSummary = async (summaryId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/summaries/${summaryId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error deleting summary:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSummary:", error);
    return false;
  }
};

/**
 * Fetches all summaries with optional filtering via API
 * @param options - Filtering and pagination options
 * @returns Array of summaries with user data and pagination info
 */
export const getAllSummaries = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  user_id?: string;
  sort_by?:
    | "created_at"
    | "updated_at"
    | "upload_date"
    | "last_edited_at"
    | "name";
  sort_order?: "asc" | "desc";
}): Promise<{
  summaries: SummaryWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} | null> => {
  try {
    const params = new URLSearchParams();

    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.search) params.append("search", options.search);
    if (options?.user_id) params.append("user_id", options.user_id);
    if (options?.sort_by) params.append("sort_by", options.sort_by);
    if (options?.sort_order) params.append("sort_order", options.sort_order);

    const response = await fetch(`/api/summaries?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error fetching summaries:", await response.text());
      return null;
    }

    const data = await response.json();

    // User data should now be included via optimized API - no additional processing needed
    const summariesWithUser: SummaryWithUser[] = data.summaries;

    return {
      summaries: summariesWithUser,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error("Error in getAllSummaries:", error);
    return null;
  }
};

/**
 * Sanitizes a filename to be safe for storage
 * @param filename - The original filename
 * @returns A sanitized filename
 */
const sanitizeFilename = (filename: string): string => {
  // Get file extension
  const lastDotIndex = filename.lastIndexOf(".");
  const extension = lastDotIndex !== -1 ? filename.substring(lastDotIndex) : "";
  const nameWithoutExt =
    lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;

  // Replace problematic characters and encode Hebrew/special characters
  const sanitized = nameWithoutExt
    // Replace Hebrew characters and other special characters with safe alternatives
    .replace(/[^\w\-_\.\s]/g, "_")
    // Replace multiple spaces/underscores with single underscore
    .replace(/[\s_]+/g, "_")
    // Remove leading/trailing underscores
    .replace(/^_+|_+$/g, "")
    // Limit length to avoid issues
    .substring(0, 100);

  return sanitized + extension;
};

/**
 * Uploads a file to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID for organizing files
 * @returns The file URL or null if upload fails
 */
export const uploadSummaryFile = async (
  file: File,
  userId: string
): Promise<string | null> => {
  try {
    const supabase = createClient();

    // Generate unique filename with user folder structure
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(file.name);
    const fileName = `${userId}/${new Date().getFullYear()}/${
      new Date().getMonth() + 1
    }/${timestamp}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from("summaries")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      console.error("File details:", {
        name: file.name,
        sanitizedName,
        fileName,
        size: file.size,
        type: file.type,
      });
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("summaries")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadSummaryFile:", error);
    return null;
  }
};

/**
 * Deletes a file from Supabase Storage
 * @param fileUrl - The full URL of the file to delete
 * @returns True if deletion was successful, false otherwise
 */
export const deleteSummaryFile = async (fileUrl: string): Promise<boolean> => {
  try {
    const supabase = createClient();

    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathSegments = url.pathname.split("/");
    const bucketIndex = pathSegments.findIndex(
      (segment) => segment === "summaries"
    );

    if (bucketIndex === -1) {
      console.error("Invalid file URL - bucket not found");
      return false;
    }

    const filePath = pathSegments.slice(bucketIndex + 1).join("/");

    const { error } = await supabase.storage
      .from("summaries")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting file:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteSummaryFile:", error);
    return false;
  }
};

/**
 * Gets all summaries by a specific user
 * @param userId - The user's ID
 * @param options - Additional filtering options
 * @returns Array of summaries with user data and pagination info
 */
export const getSummariesByUser = async (
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?:
      | "created_at"
      | "updated_at"
      | "upload_date"
      | "last_edited_at"
      | "name";
    sort_order?: "asc" | "desc";
  }
): Promise<{
  summaries: SummaryWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} | null> => {
  return getAllSummaries({
    ...options,
    user_id: userId,
  });
};

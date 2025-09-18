import { User as DbUser } from "../types/db-schema";

/**
 * Fetches a user from the database by ID via API
 * @param userId - The user's ID
 * @returns The database user or null if not found
 */
export const getDbUserById = async (userId: string): Promise<DbUser | null> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error("Error fetching user:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error in getDbUserById:", error);
    return null;
  }
};

/**
 * Creates or updates a user in the database via API
 * @param userData - The user data to insert/update
 * @returns The database user or null if operation fails
 */
export const createOrUpdateDbUser = async (userData: {
  id: string;
  email: string;
  full_name?: string;
  grade?: string;
}): Promise<DbUser | null> => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      console.error("Error creating/updating user:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error in createOrUpdateDbUser:", error);
    return null;
  }
};

/**
 * Updates a user's profile in the database via API
 * @param userId - The user's ID
 * @param updates - The fields to update
 * @returns The updated database user or null if operation fails
 */
export const updateDbUser = async (
  userId: string,
  updates: Partial<Pick<DbUser, "full_name" | "grade">>
): Promise<DbUser | null> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      console.error("Error updating user:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error in updateDbUser:", error);
    return null;
  }
};

/**
 * Deletes a user from the database via API
 * @param userId - The user's ID
 * @returns True if deletion was successful, false otherwise
 */
export const deleteDbUser = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error deleting user:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteDbUser:", error);
    return false;
  }
};

/**
 * Fetches all users with optional filtering via API
 * @param options - Filtering and pagination options
 * @returns Array of users and pagination info
 */
export const getAllUsers = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
}): Promise<{
  users: DbUser[];
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
    if (options?.grade) params.append("grade", options.grade);

    const response = await fetch(`/api/users?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Error fetching users:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return null;
  }
};

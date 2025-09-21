import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllSummaries,
  getSummaryById,
  createSummary,
  updateSummary,
  deleteSummary,
} from "../functions/summaryFunctions";
import { SummaryWithUser } from "../types/db-schema";

// Query keys for consistent cache management
export const summaryKeys = {
  all: ["summaries"] as const,
  lists: () => [...summaryKeys.all, "list"] as const,
  list: (filters: SummariesQueryFilters) =>
    [...summaryKeys.lists(), filters] as const,
  details: () => [...summaryKeys.all, "detail"] as const,
  detail: (id: string) => [...summaryKeys.details(), id] as const,
};

export interface SummariesQueryFilters {
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
}

/**
 * Hook to fetch cached summaries with filtering
 */
export const useCachedSummaries = (filters: SummariesQueryFilters = {}) => {
  return useQuery({
    queryKey: summaryKeys.list(filters),
    queryFn: () => getAllSummaries(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter for list data that changes frequently
    gcTime: 1000 * 60 * 5, // 5 minutes cache time
    retry: 2,
  });
};

/**
 * Hook to fetch a single cached summary by ID
 */
export const useCachedSummary = (summaryId: string | null) => {
  return useQuery({
    queryKey: summaryKeys.detail(summaryId || ""),
    queryFn: () => (summaryId ? getSummaryById(summaryId) : null),
    staleTime: 1000 * 60 * 5, // 5 minutes - longer for detail data
    gcTime: 1000 * 60 * 10, // 10 minutes cache time
    enabled: !!summaryId, // Only run query if summaryId exists
    retry: 2,
  });
};

/**
 * Hook to create a new summary with cache invalidation
 */
export const useCreateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (summaryData: {
      name: string;
      description?: string;
      file_urls: string[];
    }) => createSummary(summaryData),
    onSuccess: (newSummary) => {
      // Invalidate all summary lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: summaryKeys.lists() });

      // If we have the new summary, add it to the cache
      if (newSummary) {
        queryClient.setQueryData(summaryKeys.detail(newSummary.id), newSummary);
      }
    },
    onError: (error) => {
      console.error("Error creating summary:", error);
    },
  });
};

/**
 * Hook to update a summary with cache invalidation
 */
export const useUpdateSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      summaryId,
      updates,
    }: {
      summaryId: string;
      updates: {
        name?: string;
        description?: string;
        file_urls?: string[];
      };
    }) => updateSummary(summaryId, updates),
    onSuccess: (updatedSummary, { summaryId }) => {
      // Invalidate all summary lists
      queryClient.invalidateQueries({ queryKey: summaryKeys.lists() });

      // Update the specific summary in cache
      if (updatedSummary) {
        queryClient.setQueryData(summaryKeys.detail(summaryId), updatedSummary);
      }

      // Also invalidate the detail query to refetch if needed
      queryClient.invalidateQueries({
        queryKey: summaryKeys.detail(summaryId),
      });
    },
    onError: (error) => {
      console.error("Error updating summary:", error);
    },
  });
};

/**
 * Hook to delete a summary with cache invalidation
 */
export const useDeleteSummary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (summaryId: string) => deleteSummary(summaryId),
    onSuccess: (success, summaryId) => {
      if (success) {
        // Remove the deleted summary from cache
        queryClient.removeQueries({ queryKey: summaryKeys.detail(summaryId) });

        // Invalidate all summary lists to refetch without the deleted item
        queryClient.invalidateQueries({ queryKey: summaryKeys.lists() });
      }
    },
    onError: (error) => {
      console.error("Error deleting summary:", error);
    },
  });
};

/**
 * Hook to prefetch summaries (useful for hover states, etc.)
 */
export const usePrefetchSummaries = () => {
  const queryClient = useQueryClient();

  const prefetchSummaries = (filters: SummariesQueryFilters = {}) => {
    return queryClient.prefetchQuery({
      queryKey: summaryKeys.list(filters),
      queryFn: () => getAllSummaries(filters),
      staleTime: 1000 * 60 * 2,
    });
  };

  const prefetchSummary = (summaryId: string) => {
    return queryClient.prefetchQuery({
      queryKey: summaryKeys.detail(summaryId),
      queryFn: () => getSummaryById(summaryId),
      staleTime: 1000 * 60 * 5,
    });
  };

  return { prefetchSummaries, prefetchSummary };
};

/**
 * Hook to get cached summary data without triggering a new query
 */
export const useGetCachedSummary = () => {
  const queryClient = useQueryClient();

  return (summaryId: string): SummaryWithUser | undefined => {
    return queryClient.getQueryData(summaryKeys.detail(summaryId));
  };
};

/**
 * Hook to manually update cache data
 */
export const useUpdateSummaryCache = () => {
  const queryClient = useQueryClient();

  const updateSummaryInCache = (
    summaryId: string,
    updater: (old: SummaryWithUser | undefined) => SummaryWithUser
  ) => {
    queryClient.setQueryData(summaryKeys.detail(summaryId), updater);
  };

  const addSummaryToListCache = (
    filters: SummariesQueryFilters,
    newSummary: SummaryWithUser
  ) => {
    queryClient.setQueryData(
      summaryKeys.list(filters),
      (
        old:
          | {
              summaries: SummaryWithUser[];
              pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
              };
            }
          | undefined
      ) => {
        if (!old) return null;

        return {
          ...old,
          summaries: [newSummary, ...old.summaries],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      }
    );
  };

  return { updateSummaryInCache, addSummaryToListCache };
};

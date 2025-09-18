"use client";

import { useState, useEffect, useCallback } from "react";
import { User as AuthUser } from "@supabase/supabase-js";
import { User as DbUser } from "../types/db-schema";
import { createClient } from "../utils/supabase/client";
import {
  getDbUserById,
  createOrUpdateDbUser,
} from "../functions/userFunctions";

interface UseRealtimeUserReturn {
  user: DbUser | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and subscribe to realtime updates for a database user
 * @param authUser - The authenticated user from Supabase Auth
 * @returns Object containing the database user, loading state, error, and refetch function
 */
export const useRealtimeUser = (
  authUser: AuthUser | null
): UseRealtimeUserReturn => {
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch or create the database user using API routes
      let dbUser = await getDbUserById(authUser.id);

      if (!dbUser) {
        // If no database user exists, create one
        dbUser = await createOrUpdateDbUser({
          id: authUser.id,
          email: authUser.email || "",
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            null,
        });
      }

      if (!dbUser) {
        throw new Error("Failed to fetch or create database user");
      }

      setUser(dbUser);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      setError(null);
      return;
    }

    const supabase = createClient();

    // Initial fetch
    fetchUser();

    // Set up realtime subscription for database user changes
    const realtimeChannel = supabase
      .channel(`user-${authUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: `id=eq.${authUser.id}`,
        },
        async (payload) => {
          console.log("Realtime user update:", payload);

          if (
            payload.eventType === "UPDATE" ||
            payload.eventType === "INSERT"
          ) {
            setUser(payload.new as DbUser);
          } else if (payload.eventType === "DELETE") {
            setUser(null);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [authUser, fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};

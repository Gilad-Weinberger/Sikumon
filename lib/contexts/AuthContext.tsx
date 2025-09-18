"use client";

import { User as AuthUser } from "@supabase/supabase-js";
import { User as DbUser } from "../types/db-schema";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "../utils/supabase/client";
import { useRealtimeUser } from "../hooks/useRealtimeUser";

interface AuthContextType {
  user: DbUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Use the realtime hook to manage database user
  const {
    user,
    loading: userLoading,
    error: userError,
    refetch,
  } = useRealtimeUser(authUser);

  // Combined loading state
  const loading = authLoading || userLoading;

  const refreshUser = async () => {
    try {
      setAuthLoading(true);
      const supabase = createClient();

      const {
        data: { user: currentAuthUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !currentAuthUser) {
        setAuthUser(null);
        return;
      }

      setAuthUser(currentAuthUser);
    } catch (error) {
      console.error("Error fetching auth user:", error);
      setAuthUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Initial load
    refreshUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        if (session?.user) {
          setAuthUser(session.user);
        } else {
          await refreshUser();
        }
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
      }
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Log user errors
  useEffect(() => {
    if (userError) {
      console.error("User hook error:", userError);
    }
  }, [userError]);

  const value = {
    user,
    loading,
    refreshUser: async () => {
      await refreshUser();
      await refetch();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

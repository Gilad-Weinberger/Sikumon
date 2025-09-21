// Database schema types for Supabase

export type GradeLevel = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  grade?: GradeLevel | null;
  created_at: string;
  updated_at: string;
}

export interface Summary {
  id: string;
  name: string;
  description?: string | null;
  user_id: string;
  file_urls: string[];
  upload_date: string;
  last_edited_at: string;
  created_at: string;
  updated_at: string;
}

// Extended Summary type that includes user data from joins
export interface SummaryWithUser extends Summary {
  user?: {
    id: string;
    full_name?: string | null;
  } | null;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          grade?: GradeLevel | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          grade?: GradeLevel | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      summaries: {
        Row: Summary;
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          user_id: string;
          file_urls?: string[];
          upload_date?: string;
          last_edited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          user_id?: string;
          file_urls?: string[];
          upload_date?: string;
          last_edited_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "summaries_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      summaries_with_users: {
        Row: {
          id: string;
          name: string;
          description?: string | null;
          user_id: string;
          file_urls: string[];
          upload_date: string;
          last_edited_at: string;
          created_at: string;
          updated_at: string;
          user_full_name?: string | null;
          user_grade?: GradeLevel | null;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

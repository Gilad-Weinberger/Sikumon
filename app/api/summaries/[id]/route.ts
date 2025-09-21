import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/utils/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/summaries/[id] - Get a specific summary by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: summary, error } = await supabase
      .from("summaries_with_users")
      .select(
        `
        id,
        name,
        description,
        user_id,
        file_urls,
        upload_date,
        last_edited_at,
        created_at,
        updated_at,
        user_full_name,
        user_grade
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Summary not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching summary:", error);
      return NextResponse.json(
        { error: "Failed to fetch summary" },
        { status: 500 }
      );
    }

    // Transform data to include user object
    const summaryWithUser = {
      id: summary.id,
      name: summary.name,
      description: summary.description,
      user_id: summary.user_id,
      file_urls: summary.file_urls,
      upload_date: summary.upload_date,
      last_edited_at: summary.last_edited_at,
      created_at: summary.created_at,
      updated_at: summary.updated_at,
      user: summary.user_full_name
        ? {
            id: summary.user_id,
            full_name: summary.user_full_name,
          }
        : null,
    };

    return NextResponse.json({ summary: summaryWithUser });
  } catch (error) {
    console.error("Error in GET /api/summaries/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/summaries/[id] - Update a specific summary
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, file_urls } = body;

    // Build update object with only provided fields
    const updates: {
      name?: string;
      description?: string | null;
      file_urls?: string[];
      last_edited_at: string;
      updated_at: string;
    } = {
      last_edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (file_urls !== undefined) {
      if (!Array.isArray(file_urls) || file_urls.length === 0) {
        return NextResponse.json(
          { error: "At least one file URL is required" },
          { status: 400 }
        );
      }
      updates.file_urls = file_urls;
    }

    // Update summary (RLS will ensure only owner can update)
    const { data: summary, error } = await supabase
      .from("summaries")
      .update(updates)
      .eq("id", id)
      .eq("user_id", authUser.id) // Extra security check
      .select(
        `
        id,
        name,
        description,
        user_id,
        file_urls,
        upload_date,
        last_edited_at,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            error:
              "Summary not found or you don't have permission to update it",
          },
          { status: 404 }
        );
      }
      console.error("Error updating summary:", error);
      return NextResponse.json(
        { error: "Failed to update summary" },
        { status: 500 }
      );
    }

    // Fetch user data for the updated summary using direct query
    const { data: userData } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("id", summary.user_id)
      .single();

    const summaryWithUser = {
      ...summary,
      user: userData
        ? {
            id: userData.id,
            full_name: userData.full_name,
          }
        : null,
    };

    return NextResponse.json({ summary: summaryWithUser });
  } catch (error) {
    console.error("Error in PUT /api/summaries/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/summaries/[id] - Delete a specific summary
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First, get the summary to get file URLs for cleanup
    const { data: summary, error: fetchError } = await supabase
      .from("summaries")
      .select("file_urls, user_id")
      .eq("id", id)
      .eq("user_id", authUser.id) // Extra security check
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            error:
              "Summary not found or you don't have permission to delete it",
          },
          { status: 404 }
        );
      }
      console.error("Error fetching summary for deletion:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch summary" },
        { status: 500 }
      );
    }

    // Delete the summary record (RLS will ensure only owner can delete)
    const { error: deleteError } = await supabase
      .from("summaries")
      .delete()
      .eq("id", id)
      .eq("user_id", authUser.id); // Extra security check

    if (deleteError) {
      console.error("Error deleting summary:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete summary" },
        { status: 500 }
      );
    }

    // TODO: Optionally delete associated files from storage
    // This could be done in a background job or webhook
    // For now, we'll leave the files in storage as they might be referenced elsewhere

    return NextResponse.json({
      message: "Summary deleted successfully",
      deletedFileUrls: summary.file_urls, // Return for potential cleanup
    });
  } catch (error) {
    console.error("Error in DELETE /api/summaries/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

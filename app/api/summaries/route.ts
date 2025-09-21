import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/utils/supabase/server";

// GET /api/summaries - Get all summaries (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const userId = searchParams.get("user_id");
    const sortBy = searchParams.get("sort_by") || "created_at";
    const sortOrder = searchParams.get("sort_order") || "desc";

    const offset = (page - 1) * limit;

    // Use optimized view that includes user data via join
    let query = supabase
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
      `,
        { count: "exact" }
      )
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (userId) {
      query = query.eq("user_id", userId);
    }

    // Apply sorting
    const validSortColumns = [
      "created_at",
      "updated_at",
      "upload_date",
      "last_edited_at",
      "name",
    ];
    if (validSortColumns.includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data: summaries, error, count } = await query;

    if (error) {
      console.error("Error fetching summaries:", error);
      return NextResponse.json(
        { error: "Failed to fetch summaries", details: error.message },
        { status: 500 }
      );
    }

    if (!summaries) {
      return NextResponse.json({
        summaries: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Transform data to include user object - NO MORE SEPARATE API CALLS!
    const summariesWithUser = summaries.map((summary) => ({
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
    }));

    return NextResponse.json({
      summaries: summariesWithUser,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/summaries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/summaries - Create a new summary
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!file_urls || !Array.isArray(file_urls) || file_urls.length === 0) {
      return NextResponse.json(
        { error: "At least one file URL is required" },
        { status: 400 }
      );
    }

    // Create summary
    const { data: summary, error } = await supabase
      .from("summaries")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        user_id: authUser.id,
        file_urls: file_urls,
      })
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
      console.error("Error creating summary:", error);
      return NextResponse.json(
        { error: "Failed to create summary" },
        { status: 500 }
      );
    }

    // Fetch user data for the created summary using direct query
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

    return NextResponse.json({ summary: summaryWithUser }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/summaries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

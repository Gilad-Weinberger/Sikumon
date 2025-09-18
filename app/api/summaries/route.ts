import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/utils/supabase/server";
import { getDbUserById } from "../../../lib/functions/userFunctions";

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

    // Build query without user join - we'll fetch user data separately
    let query = supabase
      .from("summaries")
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

    // Fetch user data for each summary
    const summariesWithUser = await Promise.all(
      summaries.map(async (summary) => {
        let userData = null;
        try {
          userData = await getDbUserById(summary.user_id);
        } catch (err) {
          console.warn(
            `Failed to fetch user data for user_id: ${summary.user_id}`,
            err
          );
        }

        return {
          ...summary,
          user: userData
            ? {
                id: userData.id,
                full_name: userData.full_name,
              }
            : null,
        };
      })
    );

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

    // Fetch user data for the created summary
    let userData = null;
    try {
      userData = await getDbUserById(summary.user_id);
    } catch (err) {
      console.warn(
        `Failed to fetch user data for user_id: ${summary.user_id}`,
        err
      );
    }

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

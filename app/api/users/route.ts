import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../lib/utils/supabase/server";

// GET /api/users - Get all users (with optional filtering)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const grade = searchParams.get("grade");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (grade) {
      query = query.eq("grade", grade);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Error in GET /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (typically called during auth signup)
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
    const { id, email, full_name, grade } = body;

    // Validate required fields
    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing required fields: id and email" },
        { status: 400 }
      );
    }

    // Validate grade if provided
    if (grade && !["A", "B", "C", "D", "E", "F", "G"].includes(grade)) {
      return NextResponse.json(
        { error: "Invalid grade. Must be one of: A, B, C, D, E, F, G" },
        { status: 400 }
      );
    }

    // Create or update user using upsert
    const { data: user, error } = await supabase
      .from("users")
      .upsert({
        id,
        email,
        full_name: full_name || null,
        grade: grade || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

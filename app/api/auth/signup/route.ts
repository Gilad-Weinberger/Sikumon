import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, grade } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 }
      );
    }

    if (!grade) {
      return NextResponse.json({ error: "Grade is required" }, { status: 400 });
    }

    if (!["A", "B", "C", "D", "E", "F", "G"].includes(grade)) {
      return NextResponse.json(
        { error: "Invalid grade. Must be one of: A, B, C, D, E, F, G" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Create user profile record if signup was successful
    if (data.user) {
      try {
        await supabase.from("users").upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName.trim(),
          grade: grade,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (profileError) {
        console.error("Error creating user profile:", profileError);
        // Don't fail the signup if profile creation fails
      }
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

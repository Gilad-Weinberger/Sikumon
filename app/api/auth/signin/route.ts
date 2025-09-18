import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../lib/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Signed in successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 400 }
    );
  }
}

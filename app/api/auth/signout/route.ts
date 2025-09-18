import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        message: "Signed out successfully",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "An error occurred during sign out" },
      { status: 400 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType: string = payload.type;
    const data = payload.data;

    const supabase = getServiceClient();

    if (eventType === "user.created") {
      const clerkId: string = data.id;
      const email: string =
        data.email_addresses?.[0]?.email_address ??
        `${clerkId}@ao-pilot.app`;
      const name: string =
        [data.first_name, data.last_name].filter(Boolean).join(" ") ||
        email.split("@")[0];

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkId)
        .single();

      if (!existingUser) {
        // Create company
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: `Entreprise de ${name}`,
            default_margin: 30.0,
          })
          .select("id")
          .single();

        if (companyError || !company) {
          console.error("[clerk-webhook] Failed to create company:", companyError);
          return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
        }

        // Create user
        const { error: userError } = await supabase
          .from("users")
          .insert({
            clerk_id: clerkId,
            email,
            name,
            role: "admin",
            company_id: company.id,
          });

        if (userError) {
          console.error("[clerk-webhook] Failed to create user:", userError);
          return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        console.log(`[clerk-webhook] Provisioned user ${name} (${email})`);
      }
    }

    if (eventType === "user.updated") {
      const clerkId: string = data.id;
      const email: string | undefined =
        data.email_addresses?.[0]?.email_address;
      const name: string | undefined =
        [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined;

      const updates: Record<string, string> = {};
      if (email) updates.email = email;
      if (name) updates.name = name;

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("users")
          .update(updates)
          .eq("clerk_id", clerkId);

        if (error) {
          console.error("[clerk-webhook] Failed to update user:", error);
          return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
        }

        console.log(`[clerk-webhook] Updated user ${clerkId}:`, updates);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[clerk-webhook] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

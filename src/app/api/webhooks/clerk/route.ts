import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { getServiceClient } from "@/lib/supabase";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string | null;
    last_name: string | null;
  };
  type: string;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET not configured" },
      { status: 500 }
    );
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: ClerkUserEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 401 }
    );
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ data: "ignored" });
  }

  const { id: clerkId, email_addresses, first_name, last_name } = event.data;
  const email = email_addresses[0]?.email_address ?? "";
  const name = [first_name, last_name].filter(Boolean).join(" ") || email;

  const supabase = getServiceClient();

  // Create company for the new user
  const companyName = `${name} — Entreprise`;
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({ name: companyName, default_margin: 30 })
    .select("id")
    .single();

  if (companyError || !company) {
    console.error("[clerk-webhook] Failed to create company:", companyError?.message);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }

  // Create user linked to the company
  const { error: userError } = await supabase.from("users").insert({
    clerk_id: clerkId,
    email,
    name,
    role: "admin",
    company_id: company.id,
  });

  if (userError) {
    console.error("[clerk-webhook] Failed to create user:", userError.message);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  console.log(`[clerk-webhook] Created company + user for ${email}`);
  return NextResponse.json({ data: "ok" });
}

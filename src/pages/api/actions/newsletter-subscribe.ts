export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const email = (body.email || "").trim().toLowerCase();

    // Basic email sanity check
    if (!email || !email.includes("@") || !email.includes(".")) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const mlKey = import.meta.env.MAILERLITE_API_KEY;
    const mlGroup = import.meta.env.MAILERLITE_GROUP_ID;

    if (!mlKey || !mlGroup) {
      console.error("[Newsletter Subscribe] MailerLite env vars not set.");
      return new Response(
        JSON.stringify({ error: "Newsletter service not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mlKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        groups: [mlGroup],
        status: "active",
      }),
    });

    // 200 = updated existing subscriber, 201 = newly created
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      console.log(`[Newsletter Subscribe] ✓ ${email} added/updated in MailerLite group ${mlGroup}.`);
      return new Response(
        JSON.stringify({ success: true, id: mlData.data?.id }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 409 = already active (treat as success, not an error)
    if (mlRes.status === 409) {
      console.log(`[Newsletter Subscribe] ${email} already in group. Treating as success.`);
      return new Response(
        JSON.stringify({ success: true, already_subscribed: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const mlErrText = await mlRes.text();
    console.error(`[Newsletter Subscribe] MailerLite error ${mlRes.status}: ${mlErrText}`);
    return new Response(
      JSON.stringify({ error: "Could not add email to list." }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[Newsletter Subscribe] Unexpected error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

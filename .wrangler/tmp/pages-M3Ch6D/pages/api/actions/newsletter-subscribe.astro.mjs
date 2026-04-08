globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@") || !email.includes(".")) {
      return new Response(
        JSON.stringify({ error: "A valid email address is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const mlKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZjlkOTAzYjc2ZGU4Y2I4YzE4YjdhN2FmNzkxNjQ3NDA4ZDFiOTY0YmZlZDUxNmYwNzk2MDkwZmFkOGE2NTIxMDIxMTdkMTRmNzhlN2UwNzgiLCJpYXQiOjE3NzQ5NzEwOTkuNDI3NzYxLCJuYmYiOjE3NzQ5NzEwOTkuNDI3NzY1LCJleHAiOjQ5MzA2NDQ2OTkuNDE5MzIxLCJzdWIiOiIyMjUyMDUyIiwic2NvcGVzIjpbXX0.knf2P9b2E6bUZd5WW74bAV8kRKy6ttvrk5EuiANWJT3Wj4kWuB4u8GYbs1wFOwgSqHymqVfGGvtLof2Spgin90dZKGvG5OhSCy_RWqC1KvHnyiHsrb0DV14Uy7mdhPvMOlai9zYYFXYdVAqLwLJfFjkSBSFjC2SRMW7X6wKtS-kxxYc4vPYX-tgl5ShxkYHYnBk7d-rmzbfjeE24fsBmh4zFBa0lnBVGIJVh05R2x4Y3_7q1LEQvWSUoJkVYDsSuuSxR8RNGzC3iQqrpNkB0MaugSSN2TC20uPLYelMeME0bgBVotW7tBb8aqbyG3Drs4naNPfF46NFFpoL-uT-vvBUSYM4n_DbAePmnGofsL7L_Tce5yMd15QZCBrfIDlw1AZZKg6_loQ7gUi4Et-Cy0uNn1T3KBpPKRWQ9f3v06WrwWgoVgzHsI6FlC52EqZlqK2kXskVivhLLfVinNpE5uO71tBcbTR3NobUUO-0ekt5H3VluH8OmM3P_w_ZHfmGisGGH72b3XMvFYUr3SNMO3V8WNILSNgHiqwQAUzgS4BIptsJoEayYZ4kRUo2GO2HEEGHwpYNG0aGGL4suqxBB4ctYSLpZ_JY667KjWLeIx7kI1-aReQ5zqpLRa9-5n2gyLjCJJLa0kTtxa0-mLsN6UoxLY7PVK05Wwo5nIS7r6AQ";
    const mlGroup = "183469983098995840";
    if (!mlKey || !mlGroup) ;
    const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mlKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        email,
        groups: [mlGroup],
        status: "active"
      })
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      console.log(`[Newsletter Subscribe] ✓ ${email} added/updated in MailerLite group ${mlGroup}.`);
      return new Response(
        JSON.stringify({ success: true, id: mlData.data?.id }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
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
  } catch (err) {
    console.error("[Newsletter Subscribe] Unexpected error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

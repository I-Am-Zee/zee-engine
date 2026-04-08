globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const STATUS_MAP = {
  7: "Delivered",
  // DELIVERED
  8: "Cancelled",
  // CANCELLED
  9: "Disputed"
  // RTO INITIATED -> Treat as Disputed
};
const POST = async ({ request }) => {
  try {
    let body = {};
    const clonedRequest = request.clone();
    try {
      const text = await clonedRequest.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.log("[Logistics Webhook] Received malformed/empty test ping.");
      return new Response(JSON.stringify({ message: "Ping Received" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!body.order_id || body.test || body.current_status === "TEST") {
      console.log("[Logistics Webhook] Shiprocket Validation Successful.");
      return new Response(JSON.stringify({ message: "Validation Successful" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const authHeader = request.headers.get("x-api-key") || request.headers.get("X-Api-Key");
    const webhookToken = "ZeliaVance_Secure_Deploy_2026";
    if (!webhookToken || authHeader !== webhookToken) {
      console.warn("[Logistics Webhook] Unauthorized real payload attempt. Check TOKEN.");
      return new Response(JSON.stringify({ error: "Unauthorized (Silent Exit)" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("[Logistics Webhook] Processing Update:", JSON.stringify(body, null, 2));
    const { order_id, current_status_id, current_status } = body;
    const snipcartStatus = STATUS_MAP[current_status_id];
    if (!snipcartStatus) {
      console.log(`[Logistics Webhook] Ignoring status: ${current_status} (${current_status_id})`);
      return new Response(JSON.stringify({ message: "Status Ignored" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const invoiceNumber = order_id.split("-").slice(0, -1).join("-") || order_id;
    const snipcartSecret = "ST_Mzg4YmFmZjMtZGFhZS00MmE1LTk2YjctZGRiY2I2YWY4MzNhNjM5MDU3MzE1NDEwMzkyMTc0";
    if (!snipcartSecret) ;
    const authBase64 = Buffer.from(`${snipcartSecret}:`).toString("base64");
    const searchResponse = await fetch(`https://app.snipcart.com/api/orders?invoiceNumber=${invoiceNumber}`, {
      headers: { "Authorization": `Basic ${authBase64}`, "Accept": "application/json" }
    });
    if (!searchResponse.ok) {
      console.error(`[Logistics Webhook] Order search failed: ${searchResponse.status}`);
      return new Response(null, { status: 200 });
    }
    const searchData = await searchResponse.json();
    const order = searchData.items?.[0];
    if (!order || !order.token) {
      console.warn(`[Logistics Webhook] Order ${invoiceNumber} not found.`);
      return new Response(null, { status: 200 });
    }
    console.log(`[Logistics Webhook] Syncing ${invoiceNumber} -> ${snipcartStatus}...`);
    const updateResponse = await fetch(`https://app.snipcart.com/api/orders/${order.token}`, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${authBase64}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ status: snipcartStatus })
    });
    if (updateResponse.ok) {
      console.log(`[Logistics Webhook] Status updated: ${invoiceNumber} -> ${snipcartStatus}.`);
      if (snipcartStatus === "Delivered") {
        console.log(`[Logistics Webhook] Triggering delivery notification for ${invoiceNumber}...`);
        const deliveryMessage = `<p>Your piece has made it home — and we genuinely hope it brings a quiet kind of joy when you first wear it. That moment when something just <em>fits</em>, not just physically but in the way it feels like it was always yours? That's what Zelia Vance is here for.</p>

<p>We'd love to hear about your experience — the order, the packaging, the piece itself. Not a generic star rating. Your real thoughts. If something felt off, we want to know. If something surprised you in a good way, we'd love to hear that too. It's how we get better at what we do — <a href="https://tally.so/r/pbWyo1" style="color: #1a1a1a; text-decoration: underline;">share your thoughts here</a>. It only takes a minute, and it means more than you know.</p>

<p>If you'd like to be among the first to know about new arrivals, seasonal pieces, and the occasional exclusive codes we share with people who've been here since the beginning — <a href="https://zeliavance.com/newsletter/confirm?email=${encodeURIComponent(order.email)}" style="color: #1a1a1a; text-decoration: underline;">stay in the loop</a>. There's always something worth discovering.</p>`;
        const notifyResponse = await fetch(`https://app.snipcart.com/api/orders/${order.token}/notifications`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authBase64}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            type: "Comment",
            deliveryMethod: "Email",
            message: deliveryMessage
          })
        });
        if (notifyResponse.ok) {
          console.log(`[Logistics Webhook] Notification triggered successfully for ${invoiceNumber}.`);
        } else {
          const errorText = await notifyResponse.text();
          console.error(`[Logistics Webhook] Notification failed: ${notifyResponse.status} - ${errorText}`);
        }
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[Logistics Webhook Error]:", err);
    return new Response(JSON.stringify({ error: "Internal processing error" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  return new Response(JSON.stringify({ message: "Logistics Webhook is active." }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };

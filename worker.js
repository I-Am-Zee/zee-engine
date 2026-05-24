import astroWorker from "./dist/_worker.js/index.js";

export default {
  // Pass regular HTTP web requests straight to Astro
  async fetch(request, env, ctx) {
    return astroWorker.fetch(request, env, ctx);
  },

  // Intercept the native Cloudflare Cron trigger
  async scheduled(event, env, ctx) {
    console.log(`[Cron Trigger] Weekly stock reconciliation event fired: ${event.cron}`);
    try {
      // Zero Network Waste: Route the request INTERNALLY.
      // This goes directly to Astro's API routing without ever leaving Cloudflare's edge or touching the internet!
      const request = new Request("https://internal-cron/api/stock/reconcile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.KV_ADMIN_SECRET}`,
          "Content-Type": "application/json"
        }
      });

      const response = await astroWorker.fetch(request, env, ctx);
      const resultText = await response.text();
      console.log(`[Cron Success] Status: ${response.status}. Response: ${resultText}`);
    } catch (err) {
      console.error("[Cron Failure] Automation failed:", err.message);
    }
  }
};

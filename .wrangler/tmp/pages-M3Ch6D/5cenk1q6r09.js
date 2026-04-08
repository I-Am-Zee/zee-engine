// <define:__ROUTES__>
var define_ROUTES_default = {
  version: 1,
  include: [
    "/_server-islands/*",
    "/_image",
    "/api/*",
    "/checkout/*",
    "/newsletter/confirm"
  ],
  exclude: [
    "/",
    "/_astro/*",
    "/snipcart-templates.html",
    "/404",
    "/about",
    "/blog",
    "/collections/*",
    "/contact",
    "/design-system",
    "/faq",
    "/lookbooks/*",
    "/newsletter/success",
    "/privacy-policy",
    "/products/*",
    "/returns",
    "/search",
    "/shipping",
    "/shop/*",
    "/terms-of-service",
    "/wishlist"
  ]
};

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/app/.wrangler/tmp/pages-M3Ch6D/bundledWorker-0.9198980326908606.mjs";
import { isRoutingRuleMatch } from "/app/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/app/.wrangler/tmp/pages-M3Ch6D/bundledWorker-0.9198980326908606.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=5cenk1q6r09.js.map

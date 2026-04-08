var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// _worker.js/index.js
import { renderers } from "./renderers.mjs";
import { c as createExports, s as serverEntrypointModule } from "./chunks/_@astrojs-ssr-adapter_roWwmkbS.mjs";
import { manifest } from "./manifest_BOHFyqRJ.mjs";
globalThis.process ??= {};
globalThis.process.env ??= {};
var serverIslandMap = /* @__PURE__ */ new Map();
var _page0 = /* @__PURE__ */ __name(() => import("./pages/_image.astro.mjs"), "_page0");
var _page1 = /* @__PURE__ */ __name(() => import("./pages/404.astro.mjs"), "_page1");
var _page2 = /* @__PURE__ */ __name(() => import("./pages/about.astro.mjs"), "_page2");
var _page3 = /* @__PURE__ */ __name(() => import("./pages/api/actions/newsletter-subscribe.astro.mjs"), "_page3");
var _page4 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/initiate.astro.mjs"), "_page4");
var _page5 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/order-completed.astro.mjs"), "_page5");
var _page6 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/payment-methods.astro.mjs"), "_page6");
var _page7 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/stripe-create-intent.astro.mjs"), "_page7");
var _page8 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/taxes.astro.mjs"), "_page8");
var _page9 = /* @__PURE__ */ __name(() => import("./pages/api/checkout/verify.astro.mjs"), "_page9");
var _page10 = /* @__PURE__ */ __name(() => import("./pages/api/shipping/rates.astro.mjs"), "_page10");
var _page11 = /* @__PURE__ */ __name(() => import("./pages/api/webhooks/logistics-sync.astro.mjs"), "_page11");
var _page12 = /* @__PURE__ */ __name(() => import("./pages/blog.astro.mjs"), "_page12");
var _page13 = /* @__PURE__ */ __name(() => import("./pages/checkout/razorpay.astro.mjs"), "_page13");
var _page14 = /* @__PURE__ */ __name(() => import("./pages/checkout/stripe.astro.mjs"), "_page14");
var _page15 = /* @__PURE__ */ __name(() => import("./pages/checkout/stripe-success.astro.mjs"), "_page15");
var _page16 = /* @__PURE__ */ __name(() => import("./pages/collections/_tag_.astro.mjs"), "_page16");
var _page17 = /* @__PURE__ */ __name(() => import("./pages/collections.astro.mjs"), "_page17");
var _page18 = /* @__PURE__ */ __name(() => import("./pages/contact.astro.mjs"), "_page18");
var _page19 = /* @__PURE__ */ __name(() => import("./pages/design-system.astro.mjs"), "_page19");
var _page20 = /* @__PURE__ */ __name(() => import("./pages/faq.astro.mjs"), "_page20");
var _page21 = /* @__PURE__ */ __name(() => import("./pages/lookbooks/_slug_.astro.mjs"), "_page21");
var _page22 = /* @__PURE__ */ __name(() => import("./pages/lookbooks.astro.mjs"), "_page22");
var _page23 = /* @__PURE__ */ __name(() => import("./pages/newsletter/confirm.astro.mjs"), "_page23");
var _page24 = /* @__PURE__ */ __name(() => import("./pages/newsletter/success.astro.mjs"), "_page24");
var _page25 = /* @__PURE__ */ __name(() => import("./pages/privacy-policy.astro.mjs"), "_page25");
var _page26 = /* @__PURE__ */ __name(() => import("./pages/products/_slug_.astro.mjs"), "_page26");
var _page27 = /* @__PURE__ */ __name(() => import("./pages/returns.astro.mjs"), "_page27");
var _page28 = /* @__PURE__ */ __name(() => import("./pages/search.astro.mjs"), "_page28");
var _page29 = /* @__PURE__ */ __name(() => import("./pages/shipping.astro.mjs"), "_page29");
var _page30 = /* @__PURE__ */ __name(() => import("./pages/shop/_category_.astro.mjs"), "_page30");
var _page31 = /* @__PURE__ */ __name(() => import("./pages/shop/_---page_.astro.mjs"), "_page31");
var _page32 = /* @__PURE__ */ __name(() => import("./pages/terms-of-service.astro.mjs"), "_page32");
var _page33 = /* @__PURE__ */ __name(() => import("./pages/wishlist.astro.mjs"), "_page33");
var _page34 = /* @__PURE__ */ __name(() => import("./pages/index.astro.mjs"), "_page34");
var pageMap = /* @__PURE__ */ new Map([
  ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
  ["src/pages/404.astro", _page1],
  ["src/pages/about.astro", _page2],
  ["src/pages/api/actions/newsletter-subscribe.ts", _page3],
  ["src/pages/api/checkout/initiate.ts", _page4],
  ["src/pages/api/checkout/order-completed.ts", _page5],
  ["src/pages/api/checkout/payment-methods.ts", _page6],
  ["src/pages/api/checkout/stripe-create-intent.ts", _page7],
  ["src/pages/api/checkout/taxes.ts", _page8],
  ["src/pages/api/checkout/verify.ts", _page9],
  ["src/pages/api/shipping/rates.ts", _page10],
  ["src/pages/api/webhooks/logistics-sync.ts", _page11],
  ["src/pages/blog.astro", _page12],
  ["src/pages/checkout/razorpay.astro", _page13],
  ["src/pages/checkout/stripe.astro", _page14],
  ["src/pages/checkout/stripe-success.astro", _page15],
  ["src/pages/collections/[tag].astro", _page16],
  ["src/pages/collections/index.astro", _page17],
  ["src/pages/contact.astro", _page18],
  ["src/pages/design-system.astro", _page19],
  ["src/pages/faq.astro", _page20],
  ["src/pages/lookbooks/[slug].astro", _page21],
  ["src/pages/lookbooks/index.astro", _page22],
  ["src/pages/newsletter/confirm.astro", _page23],
  ["src/pages/newsletter/success.astro", _page24],
  ["src/pages/privacy-policy.astro", _page25],
  ["src/pages/products/[slug].astro", _page26],
  ["src/pages/returns.astro", _page27],
  ["src/pages/search.astro", _page28],
  ["src/pages/shipping.astro", _page29],
  ["src/pages/shop/[category].astro", _page30],
  ["src/pages/shop/[...page].astro", _page31],
  ["src/pages/terms-of-service.astro", _page32],
  ["src/pages/wishlist.astro", _page33],
  ["src/pages/index.astro", _page34]
]);
var _manifest = Object.assign(manifest, {
  pageMap,
  serverIslandMap,
  renderers,
  actions: /* @__PURE__ */ __name(() => import("./noop-entrypoint.mjs"), "actions"),
  middleware: /* @__PURE__ */ __name(() => import("./_astro-internal_middleware.mjs"), "middleware")
});
var _args = void 0;
var _exports = createExports(_manifest);
var __astrojsSsrVirtualEntry = _exports.default;
var _start = "start";
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
  serverEntrypointModule[_start](_manifest, _args);
}
export {
  __astrojsSsrVirtualEntry as default,
  pageMap
};
//# sourceMappingURL=bundledWorker-0.9198980326908606.mjs.map

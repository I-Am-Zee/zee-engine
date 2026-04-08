globalThis.process ??= {}; globalThis.process.env ??= {};
import { d as defineMiddleware, s as sequence } from './chunks/index_BkbHsAVV.mjs';
import './chunks/astro-designed-error-pages_CBK4KuBi.mjs';
import './chunks/astro/server_C0Zh7G4i.mjs';

const onRequest$2 = defineMiddleware(async (context, next) => {
  const ua = context.request.headers.get("user-agent") || "No UA";
  console.log(`[middleware] Processing request: ${context.url.pathname} (UA: ${ua})`);
  const response = await next();
  return response;
});

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	onRequest$2

);

export { onRequest };

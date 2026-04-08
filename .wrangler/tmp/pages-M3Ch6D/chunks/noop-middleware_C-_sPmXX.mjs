globalThis.process ??= {}; globalThis.process.env ??= {};
import { ab as NOOP_MIDDLEWARE_HEADER } from './astro/server_C0Zh7G4i.mjs';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

export { NOOP_MIDDLEWARE_FN as N };

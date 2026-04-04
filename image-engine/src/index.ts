export interface Env {
  IMAGES_BUCKET: R2Bucket;
  ALLOWED_DOMAINS: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Only handle GET and HEAD requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Security check: Verify Referer if set
    const referer = request.headers.get("Referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const allowedDomains: string[] = JSON.parse(env.ALLOWED_DOMAINS || "[]");

        let isAllowed = false;
        for (const domain of allowedDomains) {
          if (refererUrl.hostname === domain || refererUrl.hostname.endsWith("." + domain) || refererUrl.hostname === "localhost") {
            isAllowed = true;
            break;
          }
        }

        if (!isAllowed) {
          return new Response("Forbidden", { status: 403 });
        }
      } catch (e) {
        return new Response("Invalid Referer", { status: 400 });
      }
    }

    const objectKey = url.pathname.slice(1);
    if (!objectKey) {
      return new Response("Bad Request", { status: 400 });
    }

    // Parse resizing params
    let widthStr = url.searchParams.get("w");
    let qualityStr = url.searchParams.get("q");

    let width = parseInt(widthStr || "800", 10);
    if (isNaN(width) || ![200, 400, 800, 1200].includes(width)) {
      if (!isNaN(width) && width <= 300) width = 200;
      else if (!isNaN(width) && width <= 600) width = 400;
      else if (!isNaN(width) && width <= 1000) width = 800;
      else width = 1200;
    }

    let quality = parseInt(qualityStr || "80", 10);
    if (isNaN(quality) || quality < 1 || quality > 100) {
      quality = 80;
    }

    const imageOptions: any = {
      width,
      quality,
      sharpen: 1.0,
      format: "auto",
    };

    // Construct image resize options for Cloudflare fetch
    const options: any = { cf: { image: imageOptions } };

    const object = await env.IMAGES_BUCKET.get(objectKey);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    // Connect to the secret origin domain created by the user in the dashboard
    const originUrl = new URL(`https://vault-x92k-zee.zeliavance.com${url.pathname}`);
    const imageRequest = new Request(originUrl.toString(), request);
    
    return fetch(imageRequest, options);
  },
};

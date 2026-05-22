/**
 * Image Resolver Utility (Master Pipeline)
 * 
 * Shared logic for resolving image URLs across Server (Astro) and Client (Alpine).
 * Ensures dynamic images follow the exact same R2 Gateway rules as static images.
 */

export const resolveImage = (path: string, width?: number) => {
  if (!path) return "";
  
  // If it's already a full URL, just append the width if needed
  if (path.startsWith("http")) {
    if (!width) return path;
    const url = new URL(path);
    url.searchParams.set("w", width.toString());
    return url.toString();
  }

  // Get environment constants (Works in both Astro and Browser)
  const gateway = import.meta.env.PUBLIC_IMAGE_GATEWAY_URL || "";
  const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance";
  
  let resolvedPath = path;
  
  // Ghost Operator Path Transformation
  if (path.startsWith("/")) {
    // Transform path: /images/products/ring.webp -> /zelia-vance/products/ring.webp
    const r2Path = path.replace(/^\/images\//, `/${brandId}/`);
    resolvedPath = r2Path !== path ? r2Path : `/${brandId}${path}`;
  }
  
  // Construct Final Gateway URL
  const url = `${gateway}${resolvedPath.startsWith("/") ? "" : "/"}${resolvedPath}`;
  return width ? `${url}?w=${width}` : url;
};

/**
 * resolveSrcset - Generates a responsive srcset string
 */
export const resolveSrcset = (path: string, widths: number[] = [400, 800, 1200]) => {
  if (!path) return undefined;
  return widths.map(w => `${resolveImage(path, w)} ${w}w`).join(", ");
};

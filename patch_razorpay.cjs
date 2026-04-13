const fs = require('fs');
let code = fs.readFileSync('src/pages/checkout/razorpay.astro', 'utf-8');

// Replace the name inside options object
code = code.replace(/name: "Zelia Vance",/g, "name: brandName,");

// Also add brandName to frontmatter to fetch it
if (!code.includes("const brandSettings = await getEntry('settings', 'brand');")) {
  code = code.replace(
    "import { getEntry } from 'astro:content';",
    "import { getEntry } from 'astro:content';\nconst brandSettings = await getEntry('settings', 'brand');\nconst brandName = brandSettings?.data?.name || 'Brand';"
  );
  if (!code.includes("const brandSettings")) {
      // maybe it's missing the import entirely?
      code = code.replace(
          "---",
          "---\nimport { getEntry } from 'astro:content';\nconst brandSettings = await getEntry('settings', 'brand');\nconst brandName = brandSettings?.data?.name || 'Brand';"
      );
  }
}

fs.writeFileSync('src/pages/checkout/razorpay.astro', code);

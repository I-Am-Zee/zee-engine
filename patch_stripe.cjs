const fs = require('fs');

function patchStripeFile(file) {
    let code = fs.readFileSync(file, 'utf-8');

    // Add getEntry to top of astro block if not exists
    if (!code.includes("const brandSettings")) {
        code = code.replace(
            "---",
            "---\nimport { getEntry } from 'astro:content';\nconst brandSettings = await getEntry('settings', 'brand');\nconst brandName = brandSettings?.data?.name || 'Brand';"
        );
    }

    // Replace <title>... Zelia Vance</title> with <title>... | {brandName}</title>
    // Note: It's an HTML title tag inside the file, we can do fullTitle composition logic or just inject `{brandName}`
    code = code.replace(/<title>(.*?) - Zelia Vance<\/title>/g, "<title>$1 | {brandName}</title>");

    // Replace <div class="logo">Zelia Vance</div>
    code = code.replace(/<div class="logo">Zelia Vance<\/div>/g, '<div class="logo">{brandName}</div>');

    fs.writeFileSync(file, code);
}

patchStripeFile('src/pages/checkout/stripe.astro');
patchStripeFile('src/pages/checkout/stripe-success.astro');

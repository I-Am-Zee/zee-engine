const fs = require('fs');
let config = fs.readFileSync('src/content/config.ts', 'utf-8');
config = config.replace(
  "const faq_page = defineCollection({\n  loader: glob({\n    pattern: \"faq.json\",\n    base: `./src/content/${brandId}/pages_content`,\n  }),\n  schema: z.object({\n    heading: z.string().optional(),\n    description: z.string().optional(),\n    items: z.array(z.object({\n      question: z.string(),\n      answer: z.string(),\n    })),\n  }),\n});",
  "const faq_page = defineCollection({\n  loader: glob({\n    pattern: \"faq.json\",\n    base: `./src/content/${brandId}/pages_content`,\n  }),\n  schema: z.object({\n    heading: z.string().optional(),\n    description: z.string().optional(),\n    items: z.array(z.object({\n      question: z.string(),\n      answer: z.string(),\n    })),\n  }),\n});"
);

// Ah wait, it didn't find `faq_page` because the previous patch_faq3.cjs replaced it in a way that wasn't exactly right? Or the earlier `patch_faq2.cjs` messed it up. Let's fix it by completely replacing `faq_page`.

const faqRegex = /const faq_page = defineCollection\(\{\s*loader: glob\(\{\s*pattern: "faq\.json",\s*base: `\.\/src\/content\/\$\{brandId\}\/pages_content`,\s*\}\),\s*schema: z\.object\(\{\s*heading: z\.string\(\)\.optional\(\),\s*description: z\.string\(\)\.optional\(\),\s*items: z\.array\(z\.object\(\{\s*question: z\.string\(\),\s*answer: z\.string\(\),\s*\}\)\),\s*\}\),\s*\}\);/;

if (faqRegex.test(config)) {
    console.log("FAQ page matches regex.");
}

// Let's remove the faq_page definition and re-add it perfectly.
config = config.replace(faqRegex, "");

const correctFaq = `const faq_page = defineCollection({
  loader: file(\`src/content/\${brandId}/pages_content/faq.json\`),
});`;

config = config.replace('const pages_content = defineCollection({', correctFaq + '\n\nconst pages_content = defineCollection({');
fs.writeFileSync('src/content/config.ts', config);

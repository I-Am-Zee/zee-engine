## Cloudflare Email Address Obfuscation in Astro Applications

## The Problem: Email Scraping

Publicly visible email addresses on websites are primary targets for automated bots and web scrapers. These bots harvest plain-text addresses to populate spam databases, leading to a high volume of unsolicited emails for site owners.

## The Solution: Cloudflare Email Address Obfuscation

Cloudflare provides a built-in security feature called Email Address Obfuscation, located within the Scrape Shield settings. It is a free service available on all plans.

- Mechanism: When enabled, Cloudflare’s edge servers intercept the HTML of a website. Any detected email address is replaced with an encoded hexadecimal string.
- Decryption: Cloudflare injects a lightweight JavaScript snippet (`email-decode.min.js`) into the page. When a human user loads the site, this script runs in the browser, decodes the string, and restores the original email address so it is readable and clickable.
- Benefit: Scrapers only see the encoded string (e.g., `[email protected]`), while human users experience no change in functionality.

## The Secondary Conflict: Astro View Transitions

When using modern web frameworks like Astro with the ClientRouter (View Transitions API), a conflict arises.

1. Initial Load: The Cloudflare decoding script runs correctly on the first page visit.
2. Client-Side Navigation: When a user clicks a link, Astro intercepts the request and replaces the body of the page without a full browser refresh.
3. The Result: Because the browser does not "reload," the Cloudflare script does not re-execute. Any email addresses on the new page remain in their encoded, unreadable state (`[email protected]`).

## The Fix: Re-initializing the Decoder

To ensure emails are decoded after every navigation in an Astro project, the Cloudflare decoding logic must be manually triggered or re-injected using Astro’s lifecycle events.

Implementation:  
Add the following script to the main `Layout.astro` component. This uses the `astro:page-load` event to ensure the decoder is processed every time a new page is swapped in by the router.

```html
<script is:inline>
  document.addEventListener('astro:page-load', () => {
    // Locate the Cloudflare obfuscation script
    const cloudflareScript = document.querySelector('script[src*="email-decode.min.js"]');
    
    if (cloudflareScript) {
      // Create a fresh copy of the script to force re-execution
      const newScript = document.createElement('script');
      newScript.src = cloudflareScript.src;
      // Use Astro's rerun attribute to ensure it executes on every transition
      newScript.dataset.astroRerun = ""; 
      cloudflareScript.replaceWith(newScript);
    }
  });
</script>
```

## Summary of Steps

1. Enable Feature: Turn on Email Address Obfuscation in the Cloudflare Dashboard under Security > Scrape Shield.
2. Integrate Fix: Place the re-initialization script in the global Astro layout to handle View Transitions.
3. Verify: Inspect the live site's source code to confirm the email is encoded, then navigate between pages to ensure it decodes correctly for the user.

Would you like to see how to verify the hex-encoded string in your browser's Network tab?


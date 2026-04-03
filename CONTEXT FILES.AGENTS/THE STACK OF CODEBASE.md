## Foundation of the project

***Astro is a JAMstack framework** that uses **Island Architecture** to make your site faster than traditional JAMstack sites.*

Island Architecture is a **rendering pattern** within the page itself.
### The Concept:
Your page is a "sea" of static, lightweight HTML (zero JavaScript). Within this sea, you drop "islands" of interactivity only where needed.
### How it works:
You use **Client Directives** to tell the browser exactly when to load the JavaScript for an island:
   - `client:load`: Load it immediately (e.g., your header navigation).
   - `client:visible`: Load it only when the user scrolls down to it (e.g., your interactive GSAP gallery).
   - `client:idle`: Load it when the main thread is free (e.g., a newsletter signup).

---

## Prerequisite knowledge: 

1. The Netlify is to be ditched. Instead we gonna use Cloudflare. 
2. PagesCMS is to be ditched. Instead we gonna use Keystatic.
## The Overall Stack (As per demand):

- Astro
- Snipcart (Custom Payment Gateway Integrated : RAZORPAY)
- Shiprocket
- Keystatic
- Cloudflare Free Tier
	  1. Cloudflared Tunnel (with custom fixed domain address >> `localhost:4321` as `dev.zeliavance.com`)
	  2. [R2 bucket for Media storage X Cloudflare Workers](CONTEXT FILES.AGENTS/IMAGE-ENGINE R2 WORKER) 
	  3. Cloudflare Pages - Content Delivery Network (CDN)
	  4. Cloudflare Routing for Emails
	    	*Refer section for [Emails] to know more.*

*We strictly don't use Vanilla CSS. We strictly don't use Vanilla JS. We dont take headache ourselves and use the community/open-sourced libraries where it feels natural and better time spent, instead of reinventing the wheel. For example: Carousel (Implemented using Splide.js).*

## Dependencies in the project as of now.

- **@alpinejs/collapse** (^3.15.6)
- **@astrojs/alpinejs** (^0.4.9)
- **@astrojs/netlify** (^6.6.4) >> Netlify (Adapter) needs to be replaced with Cloudflare (Adapter).
- **@splidejs/splide** (^4.1.4)
- **@tailwindcss/typography** (^0.5.19)
- **@tailwindcss/vite** (^4.1.18)
- **@types/alpinejs** (^3.13.11)
- **alpinejs** (^3.15.4)
- **astro** (^5.16.11)
- **fuse.js** (^7.1.0)
- **phosphor-icons-astro** (^2.1.1-17042025)
- **prettier** (^3.8.0)
- **prettier-plugin-astro** (^0.14.1)
- **prettier-plugin-tailwindcss** (^0.7.2)
- **razorpay** (^2.9.6)
- **tailwindcss** (^4.1.18)

## Docs:

- [Astro](https://docs.astro.build/en/getting-started/)
- [Snipcart](https://docs.snipcart.com/v3/)
- [Keystatic](https://keystatic.com/docs/)
- Cloudflare:
	  1. [Cloudflare R2](https://developers.cloudflare.com/r2/)
	  2. [Cloudflare Pages](https://developers.cloudflare.com/pages/)
	  3. [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Tailwind CSS](https://tailwindcss.com/docs/)
- [Alpine JS](https://alpinejs.dev/start-here)
- [Fuse JS](https://www.fusejs.io/)
- [Splide JS](https://splidejs.com/documents/)


## LATER PLANS:

*Plan is to use **GSAP** and **Lenis Scroll** for customized interactive care-guides / manuals (like how-to-care), specific pages (like about page), any specific product reveal / landing pages that may have more or text and some images for user awe and appeal.* 




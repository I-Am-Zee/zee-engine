/**
 * Blog Table of Contents Behavior
 * 
 * Handles:
 * 1. Intersection observation of headings to highlight current TOC link
 * 2. Intersection observation of the article to show/hide mobile TOC bar
 */

export function initTOC() {
  const content = document.getElementById('blog-content');
  const mobileBar = document.getElementById('toc-mobile-bar');
  
  if (!content) return;

  const headings = Array.from(content.querySelectorAll('h2, h3'));
  // Filter links that are specifically TOC links (targeting blog content headings)
  const tocLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(link => {
    const href = link.getAttribute('href');
    return href && headings.some(h => `#${h.id}` === href);
  });

  if (headings.length === 0) return;

  const activeHeadings = new Set<string>();

  // 1. Heading IntersectionObserver
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.id;
      if (entry.isIntersecting) {
        activeHeadings.add(id);
      } else {
        activeHeadings.delete(id);
      }
    });

    // Topmost intersecting wins pattern
    let currentId = '';
    for (const heading of headings) {
      if (activeHeadings.has(heading.id)) {
        currentId = heading.id;
        break;
      }
    }

    if (currentId) {
      tocLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentId}`;
        const parentLi = link.closest('li[data-toc-group]');
        const h2Slug = parentLi?.getAttribute('data-toc-group');

        if (isActive) {
          link.setAttribute('data-toc-active', 'true');
          
          // If this is an H2, it's the active group
          if (parentLi && link.getAttribute('href') === `#${h2Slug}`) {
            // Remove active group from others
            document.querySelectorAll('li[data-toc-group]').forEach(el => el.classList.remove('is-active-group'));
            parentLi.classList.add('is-active-group');
          }
        } else {
          link.removeAttribute('data-toc-active');
        }

        // Special case: If an H3 is active, ensure its parent H2 is marked as active-group
        // We find the heading in our headings array to check its depth
        const currentHeading = headings.find(h => h.id === currentId);
        if (currentHeading?.tagName === 'H3') {
           // Find the li that contains this link
           const h3ParentLi = link.closest('li[data-toc-group]');
           if (h3ParentLi && link.getAttribute('href') === `#${currentId}`) {
              document.querySelectorAll('li[data-toc-group]').forEach(el => el.classList.remove('is-active-group'));
              h3ParentLi.classList.add('is-active-group');
           }
        }
      });
    }
  }, {
    // Offset to trigger when heading is roughly at the top half of the screen
    rootMargin: "0px 0px -55% 0px",
    threshold: 0
  });

  headings.forEach((h) => headingObserver.observe(h));

  // 2. Article boundary IntersectionObserver (for mobile bar visibility)
  const mobileTrigger = document.getElementById('toc-mobile-trigger');
  if (mobileTrigger) {
    const articleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mobileTrigger.setAttribute('data-toc-visible', 'true');
        } else {
          mobileTrigger.removeAttribute('data-toc-visible');
        }
      });
    }, {
      threshold: 0
    });

    articleObserver.observe(content);
  }
}

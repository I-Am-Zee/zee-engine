/**
 * Blog Table of Contents Behavior
 * 
 * Handles:
 * 1. Intersection observation of headings to highlight current TOC link
 * 2. Intersection observation of the article to show/hide mobile TOC bar
 */

export function initTOC() {
  const content = document.getElementById('blog-content');
  if (!content) return;

  const headings = Array.from(content.querySelectorAll('h2, h3')) as HTMLElement[];
  const tocLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(link => {
    const href = link.getAttribute('href');
    return href && headings.some(h => `#${h.id}` === href);
  });

  if (headings.length === 0) return;

  function updateActiveState() {
    // Threshold is 15% of viewport height
    const threshold = window.innerHeight * 0.15;
    let currentId = '';

    // Find the last heading that is above the threshold
    for (let i = headings.length - 1; i >= 0; i--) {
      const rect = headings[i].getBoundingClientRect();
      if (rect.top <= threshold) {
        currentId = headings[i].id;
        break;
      }
    }

    // Default to first heading if none passed the threshold but we are scrolled
    if (!currentId && window.scrollY > 200) {
      currentId = headings[0].id;
    }

    if (currentId) {
      // 1. Identify the target group (H2 slug)
      const activeHeading = headings.find(h => h.id === currentId);
      let targetGroupSlug = '';
      
      if (activeHeading?.tagName === 'H2') {
        targetGroupSlug = currentId;
      } else {
        // If it's an H3, find its parent group in the DOM
        const h3Link = document.querySelector(`nav a[href="#${currentId}"], #toc-mobile-bar a[href="#${currentId}"]`);
        targetGroupSlug = h3Link?.closest('li[data-toc-group]')?.getAttribute('data-toc-group') || '';
      }

      // 2. Update active group classes (Clear once, Apply to all matches)
      document.querySelectorAll('li[data-toc-group]').forEach(el => {
        if (el.getAttribute('data-toc-group') === targetGroupSlug) {
          el.classList.add('is-active-group');
        } else {
          el.classList.remove('is-active-group');
        }
      });

      // 3. Update individual link active states
      tocLinks.forEach((link) => {
        const href = link.getAttribute('href');
        const isActive = href === `#${currentId}`;
        
        if (isActive) {
          link.setAttribute('data-toc-active', 'true');
        } else {
          link.removeAttribute('data-toc-active');
        }
      });
    } else {
      // Clear all active states if at the very top
      tocLinks.forEach(link => link.removeAttribute('data-toc-active'));
      document.querySelectorAll('li[data-toc-group]').forEach(el => el.classList.remove('is-active-group'));
    }
  }

  // Use Scroll listener for precision (throttled)
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveState();
        isScrolling = false;
      });
      isScrolling = true;
    }
  }, { passive: true });

  // Initial check
  updateActiveState();

  // Mobile bar visibility logic (still better as IntersectionObserver)
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

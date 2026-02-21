import Splide from '@splidejs/splide';
import type { Options } from '@splidejs/splide';

/**
 * Universal Splide.js behavior for Alpine.js
 * Handles initialization, navigation, and state syncing.
 */
export const carousel = (config: Options = {}) => ({
  splide: null as Splide | null,
  currentIndex: 0,

  init() {
    // Merge default premium settings with passed config
    const defaultOptions: Options = {
      type: 'loop',
      perPage: 1,
      gap: '0rem',
      arrows: false,
      pagination: false,
      speed: 800,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      ...config
    };

    this.splide = new Splide(this.$el as HTMLElement, defaultOptions);

    // Sync Splide index with Alpine state
    this.splide.on('moved', (newIndex: number) => {
      this.currentIndex = newIndex;
    });

    this.splide.mount();
  },

  next() {
    this.splide?.go('>');
  },

  prev() {
    this.splide?.go('<');
  },

  goTo(index: number) {
    this.splide?.go(index);
  },

  destroy() {
    this.splide?.destroy();
  }
});

// @ts-ignore
document.addEventListener('alpine:init', () => {
  // @ts-ignore
  window.Alpine.data('carousel', carousel);
});

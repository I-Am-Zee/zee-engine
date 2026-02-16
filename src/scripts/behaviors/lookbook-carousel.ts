/**
 * Lookbook Carousel Behavior
 * Logic for handling slide transitions and autoplay/loop
 */

export const lookbookCarousel = () => ({
  currentIndex: 0,
  totalSlides: 0,
  interval: null as any,
  autoplayMs: 5000,

  init() {
    this.totalSlides = (this as any).$refs.slides.children.length;
    // this.startAutoplay();
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
  },

  goTo(index: number) {
    this.currentIndex = index;
  },

  startAutoplay() {
    this.stopAutoplay();
    this.interval = setInterval(() => this.next(), this.autoplayMs);
  },

  stopAutoplay() {
    if (this.interval) clearInterval(this.interval);
  }
});

// @ts-ignore
document.addEventListener('alpine:init', () => {
  // @ts-ignore
  window.Alpine.data('lookbookCarousel', lookbookCarousel);
});

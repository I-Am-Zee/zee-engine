// src/scripts/behaviors/wishlist.ts

export const wishlistStore = {
  items: [] as string[],

  init() {
    const saved = localStorage.getItem('zeliavance_wishlist');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse wishlist from localStorage:', e);
        this.items = [];
      }
    }
  },

  toggle(productId: string) {
    if (this.has(productId)) {
      this.items = this.items.filter((id) => id !== productId);
    } else {
      this.items.push(productId);
    }
    this.save();
  },

  has(productId: string) {
    return this.items.includes(productId);
  },

  add(productId: string) {
    if (!this.has(productId)) {
      this.items.push(productId);
      this.save();
    }
  },

  remove(productId: string) {
    this.items = this.items.filter((id) => id !== productId);
    this.save();
  },

  save() {
    localStorage.setItem('zeliavance_wishlist', JSON.stringify(this.items));
  },

  get count() {
    return this.items.length;
  }
};

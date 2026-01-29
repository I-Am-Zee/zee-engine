// src/scripts/behaviors/alpine-entrypoint.ts
import type { Alpine } from 'alpinejs';
import { wishlistStore } from './wishlist';

export default (Alpine: Alpine) => {
  // Register the wishlist store
  Alpine.store('wishlist', wishlistStore);
};

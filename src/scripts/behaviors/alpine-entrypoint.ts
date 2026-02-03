import type { Alpine } from 'alpinejs';
import collapse from '@alpinejs/collapse';
import { wishlistStore } from './wishlist';

export default (Alpine: Alpine) => {
  // Register plugins
  Alpine.plugin(collapse);
  
  // Register the wishlist store
  Alpine.store('wishlist', wishlistStore);
};

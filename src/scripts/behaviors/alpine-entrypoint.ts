import type { Alpine } from 'alpinejs';
import collapse from '@alpinejs/collapse';
import { wishlistStore } from './wishlist';
import { popupBehavior } from './popup';

export default (Alpine: Alpine) => {
  // Register plugins
  Alpine.plugin(collapse);
  
  // Register the wishlist store
  Alpine.store('wishlist', wishlistStore);

  // Register the popup component
  Alpine.data('popupBehavior', popupBehavior as any);
};

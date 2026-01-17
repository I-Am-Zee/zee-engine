/**
 * Generic Toggle - Alpine.js data object
 * Headless behavior for menus, filters, modals, etc.
 */

export interface ToggleOptions {
  initialState?: boolean;
}

export function createToggleStore(options: ToggleOptions = {}) {
  const { initialState = false } = options;

  return {
    isOpen: initialState,

    toggle() {
      this.isOpen = !this.isOpen;
    },

    open() {
      this.isOpen = true;
    },

    close() {
      this.isOpen = false;
    },
  };
}

// Default export for simple inline usage
export default createToggleStore;

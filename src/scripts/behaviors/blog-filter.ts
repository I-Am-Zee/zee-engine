/**
 * blog-filter.ts - Behavior Logic
 * 
 * Handles the state and logic for blog category filtering.
 * Reusable across different filter layouts.
 */

export function blogFilter(initialCategories: string[] = []) {
  return {
    selectedCategories: initialCategories as string[],
    filteredCount: 0,

    init() {
      // Logic to sync with grid can be added here if needed
      // Currently, SmartBlogGrid handles the display logic, 
      // but we could centralize it here.
    },

    toggleCategory(cat: string) {
      if (this.selectedCategories.includes(cat)) {
        this.selectedCategories = this.selectedCategories.filter((c: string) => c !== cat);
      } else {
        this.selectedCategories.push(cat);
      }
    },

    clearFilters() {
      this.selectedCategories = [];
    },

    isActive(cat: string) {
      return this.selectedCategories.includes(cat);
    },

    isAllSelected() {
      return this.selectedCategories.length === 0;
    }
  };
}

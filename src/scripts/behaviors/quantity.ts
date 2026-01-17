/**
 * Quantity Selector - Alpine.js data object
 * Headless behavior for quantity input controls
 */

export interface QuantityOptions {
  min?: number;
  max?: number;
  initial?: number;
}

export function createQuantityStore(options: QuantityOptions = {}) {
  const { min = 1, max = 99, initial = 1 } = options;

  return {
    count: Math.max(min, Math.min(max, initial)),
    min,
    max,

    increment() {
      if (this.count < this.max) {
        this.count++;
      }
    },

    decrement() {
      if (this.count > this.min) {
        this.count--;
      }
    },

    set(value: number) {
      this.count = Math.max(this.min, Math.min(this.max, value));
    },

    canIncrement(): boolean {
      return this.count < this.max;
    },

    canDecrement(): boolean {
      return this.count > this.min;
    },
  };
}

// Default export for simple inline usage
export default createQuantityStore;

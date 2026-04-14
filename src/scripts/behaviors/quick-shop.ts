/**
 * Quick Shop Behavior
 * Extracts the product data and dispatches the zeliavance:quick-shop event.
 */

export function handleQuickShop(productData: any) {
  window.dispatchEvent(
    new CustomEvent("engine:quick-shop", {
      detail: productData,
      bubbles: true,
    })
  );
}

export default handleQuickShop;

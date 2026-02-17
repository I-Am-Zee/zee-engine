/**
 * Quick Shop Behavior
 * Extracts the product data and dispatches the zaviona:quick-shop event.
 */

export function handleQuickShop(productData: any) {
  window.dispatchEvent(
    new CustomEvent("zaviona:quick-shop", {
      detail: productData,
      bubbles: true,
    })
  );
}

export default handleQuickShop;

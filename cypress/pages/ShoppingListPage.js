class ShoppingListPage {
  selectors = {
    item: '.card',
    itemName: '[data-testid="shopping-cart-product-name"]',
    itemQuantity: '[data-testid="shopping-cart-product-quantity"]',
    increaseButton: '[data-testid="product-increase-quantity"]',
    clearButton: '[data-testid="limparLista"]',
    emptyMessage: '[data-testid="shopping-cart-empty-message"]',
  };

  item(name) {
    return cy.contains(this.selectors.item, name);
  }

  increaseQuantity(name) {
    this.item(name).find(this.selectors.increaseButton).click();
  }

  clear() {
    cy.get(this.selectors.clearButton).click();
  }
}

export default new ShoppingListPage();

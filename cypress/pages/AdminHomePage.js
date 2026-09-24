class AdminHomePage {
  selectors = {
    heading: 'h1',
    registerProductButton: '[data-testid="cadastrarProdutos"]',
  };

  goToProductRegistration() {
    cy.get(this.selectors.registerProductButton).click();
  }
}

export default new AdminHomePage();

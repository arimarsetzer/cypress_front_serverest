class StorePage {
  selectors = {
    heading: 'h1',
    searchInput: '[data-testid="pesquisar"]',
    searchButton: '[data-testid="botaoPesquisar"]',
    productCard: '.card',
    addToListButton: '[data-testid="adicionarNaLista"]',
  };

  /**
   * Opens the store as `user` and waits for the initial product list. The page renders the
   * full catalogue when that request resolves, so searching before it finishes can have the
   * search results overwritten by the late full list.
   */
  open(user) {
    cy.intercept('GET', /\/produtos$/).as('listProducts');
    cy.visitAuthenticated('/home', user);
    cy.wait('@listProducts');
  }

  search(term) {
    cy.intercept('GET', /\/produtos\?nome=/).as('searchProducts');
    cy.get(this.selectors.searchInput).clear();
    cy.get(this.selectors.searchInput).type(term);
    cy.get(this.selectors.searchButton).click();
    cy.wait('@searchProducts');
  }

  productCards() {
    return cy.get(this.selectors.productCard);
  }

  productCard(name) {
    return cy.contains(this.selectors.productCard, name);
  }

  addToShoppingList(name) {
    this.productCard(name).find(this.selectors.addToListButton).click();
  }
}

export default new StorePage();

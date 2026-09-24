class ProductListPage {
  productRow(name) {
    return cy.contains('tr', name);
  }
}

export default new ProductListPage();

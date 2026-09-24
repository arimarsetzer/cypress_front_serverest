class ProductFormPage {
  selectors = {
    name: '[data-testid="nome"]',
    price: '[data-testid="preco"]',
    description: '[data-testid="descricao"]',
    quantity: '[data-testid="quantity"]',
    submit: '[data-testid="cadastarProdutos"]',
  };

  register({ nome, preco, descricao, quantidade }) {
    cy.get(this.selectors.name).type(nome);
    cy.get(this.selectors.price).type(String(preco));
    cy.get(this.selectors.description).type(descricao);
    cy.get(this.selectors.quantity).type(String(quantidade));
    cy.get(this.selectors.submit).click();
  }
}

export default new ProductFormPage();

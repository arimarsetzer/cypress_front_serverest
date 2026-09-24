class SignupPage {
  selectors = {
    name: '[data-testid="nome"]',
    email: '[data-testid="email"]',
    password: '[data-testid="password"]',
    adminCheckbox: '[data-testid="checkbox"]',
    submit: '[data-testid="cadastrar"]',
    successAlert: '.alert-primary',
  };

  visit() {
    cy.visit('/cadastrarusuarios');
  }

  register({ nome, email, password, administrador }) {
    cy.get(this.selectors.name).type(nome);
    cy.get(this.selectors.email).type(email);
    cy.get(this.selectors.password).type(password, { log: false });
    if (administrador === 'true') {
      cy.get(this.selectors.adminCheckbox).check();
    }
    cy.get(this.selectors.submit).click();
  }
}

export default new SignupPage();

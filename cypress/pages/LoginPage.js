class LoginPage {
  selectors = {
    email: '[data-testid="email"]',
    password: '[data-testid="senha"]',
    submit: '[data-testid="entrar"]',
  };

  visit() {
    cy.visit('/login');
  }

  login({ email, password }) {
    cy.get(this.selectors.email).type(email);
    cy.get(this.selectors.password).type(password, { log: false });
    cy.get(this.selectors.submit).click();
  }
}

export default new LoginPage();

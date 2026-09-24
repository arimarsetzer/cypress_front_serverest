import SignupPage from '../../pages/SignupPage';
import StorePage from '../../pages/StorePage';
import { cleanupTestData } from '../../support/api/cleanup';
import { findUsersByEmail } from '../../support/api/users';
import { buildUser } from '../../support/factories/dataFactory';

describe('Frontend | Customer sign-up', () => {
  const customer = buildUser();

  afterEach(() =>
    findUsersByEmail(customer.email).then(({ body }) => cleanupTestData({ users: body.usuarios })),
  );

  it('signs up a new customer and logs them in to the store', () => {
    SignupPage.visit();
    SignupPage.register(customer);

    cy.get(SignupPage.selectors.successAlert).should(
      'contain.text',
      'Cadastro realizado com sucesso',
    );

    // The app redirects on a fixed 3-second timer after sign-up, hence the longer timeout.
    cy.location('pathname', { timeout: 15000 }).should('eq', '/home');
    cy.get(StorePage.selectors.heading).should('have.text', 'Serverest Store');
    cy.get(StorePage.selectors.searchInput).should('be.visible');
    cy.window()
      .its('localStorage')
      .invoke('getItem', 'serverest/userToken')
      .should('match', /^Bearer /);

    findUsersByEmail(customer.email).then(({ body }) => {
      expect(body.quantidade).to.eq(1);
      expect(body.usuarios[0]).to.include({
        nome: customer.nome,
        email: customer.email,
        administrador: 'false',
      });
    });
  });
});

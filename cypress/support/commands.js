/**
 * Opens a page already authenticated as `user` by seeding the same localStorage keys the
 * frontend writes after a UI login, so specs that do not test login skip the form.
 */
Cypress.Commands.add('visitAuthenticated', (path, user) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('serverest/userToken', user.token);
      win.localStorage.setItem('serverest/userEmail', user.email);
    },
  });
});

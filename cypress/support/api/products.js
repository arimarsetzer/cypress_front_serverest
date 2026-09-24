const url = (path = '') => `${Cypress.expose('apiUrl')}/produtos${path}`;
const auth = (token) => (token ? { Authorization: token } : {});

export const createProduct = (product, token, options = {}) =>
  cy.request({ method: 'POST', url: url(), headers: auth(token), body: product, ...options });

export const getProduct = (id, options = {}) =>
  cy.request({ method: 'GET', url: url(`/${id}`), ...options });

export const findProductsByName = (nome) => cy.request({ method: 'GET', url: url(), qs: { nome } });

export const deleteProduct = (id, token) =>
  cy.request({
    method: 'DELETE',
    url: url(`/${id}`),
    headers: auth(token),
    failOnStatusCode: false,
  });

const url = (path = '') => `${Cypress.expose('apiUrl')}/carrinhos${path}`;

export const createCart = (produtos, token, options = {}) =>
  cy.request({
    method: 'POST',
    url: url(),
    headers: { Authorization: token },
    body: { produtos },
    ...options,
  });

export const getCart = (id, options = {}) =>
  cy.request({ method: 'GET', url: url(`/${id}`), ...options });

/** Deletes the token owner's cart and returns its items to stock. */
export const cancelCart = (token, options = {}) =>
  cy.request({
    method: 'DELETE',
    url: url('/cancelar-compra'),
    headers: { Authorization: token },
    ...options,
  });

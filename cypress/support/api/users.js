const url = (path = '') => `${Cypress.expose('apiUrl')}/usuarios${path}`;

export const createUser = (user, options = {}) =>
  cy.request({ method: 'POST', url: url(), body: user, ...options });

export const getUser = (id, options = {}) =>
  cy.request({ method: 'GET', url: url(`/${id}`), ...options });

export const findUsersByEmail = (email) => cy.request({ method: 'GET', url: url(), qs: { email } });

export const deleteUser = (id) =>
  cy.request({ method: 'DELETE', url: url(`/${id}`), failOnStatusCode: false });

export const login = ({ email, password }, options = {}) =>
  cy.request({
    method: 'POST',
    url: `${Cypress.expose('apiUrl')}/login`,
    body: { email, password },
    ...options,
  });

/** Creates the user and logs in, yielding `{ ...user, _id, token }`. */
export const createUserWithToken = (user) =>
  createUser(user).then(({ body: { _id } }) =>
    login(user).then(({ body: { authorization } }) => ({ ...user, _id, token: authorization })),
  );

// The public ServeRest instance is shared by everyone, so every record gets a unique suffix
// to avoid collisions with other users' data and with parallel runs.
const uniqueSuffix = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

export const buildUser = ({ admin = false } = {}) => {
  const suffix = uniqueSuffix();
  return {
    nome: `QA ${admin ? 'Admin' : 'Customer'} ${suffix}`,
    email: `qa.cy.${suffix}@example.com`,
    password: `Pwd-${suffix}`,
    administrador: String(admin),
  };
};

export const buildProduct = (overrides = {}) => ({
  nome: `QA Product ${uniqueSuffix()}`,
  preco: 123,
  descricao: 'Product created by the automated test suite',
  quantidade: 10,
  ...overrides,
});

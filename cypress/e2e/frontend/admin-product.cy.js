import AdminHomePage from '../../pages/AdminHomePage';
import LoginPage from '../../pages/LoginPage';
import ProductFormPage from '../../pages/ProductFormPage';
import ProductListPage from '../../pages/ProductListPage';
import { cleanupTestData } from '../../support/api/cleanup';
import { findProductsByName } from '../../support/api/products';
import { createUserWithToken } from '../../support/api/users';
import { buildProduct, buildUser } from '../../support/factories/dataFactory';

describe('Frontend | Admin product registration', () => {
  const product = buildProduct({ preco: 4321, quantidade: 17 });
  let admin;

  beforeEach(() => {
    createUserWithToken(buildUser({ admin: true })).then((u) => (admin = u));
  });

  afterEach(() =>
    findProductsByName(product.nome).then(({ body }) =>
      cleanupTestData({
        products: body.produtos.map(({ _id }) => ({ _id, token: admin.token })),
        users: [admin],
      }),
    ),
  );

  it('logs in as an administrator and registers a product that is persisted by the API', () => {
    LoginPage.visit();
    LoginPage.login(admin);

    cy.location('pathname').should('eq', '/admin/home');
    cy.get(AdminHomePage.selectors.heading)
      .should('contain.text', 'Bem Vindo')
      .and('contain.text', admin.nome);

    AdminHomePage.goToProductRegistration();
    ProductFormPage.register(product);

    cy.location('pathname').should('eq', '/admin/listarprodutos');
    ProductListPage.productRow(product.nome)
      .should('contain.text', product.preco)
      .and('contain.text', product.descricao)
      .and('contain.text', product.quantidade);

    findProductsByName(product.nome).then(({ body }) => {
      expect(body.quantidade).to.eq(1);
      expect(body.produtos[0]).to.include({
        nome: product.nome,
        preco: product.preco,
        descricao: product.descricao,
        quantidade: product.quantidade,
      });
    });
  });
});

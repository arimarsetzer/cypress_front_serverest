import { cleanupTestData } from '../../support/api/cleanup';
import { createProduct, getProduct } from '../../support/api/products';
import { createUserWithToken } from '../../support/api/users';
import { buildProduct, buildUser } from '../../support/factories/dataFactory';

describe('API | Products', () => {
  let admin;
  let customer;
  let product;

  beforeEach(() => {
    createUserWithToken(buildUser({ admin: true })).then((u) => (admin = u));
    createUserWithToken(buildUser()).then((u) => (customer = u));
  });

  afterEach(() => cleanupTestData({ products: [product], users: [admin, customer] }));

  it('allows only authenticated administrators to create products', () => {
    const payload = buildProduct({ preco: 470, quantidade: 25 });

    createProduct(payload, customer.token, { failOnStatusCode: false }).then(({ status, body }) => {
      expect(status).to.eq(403);
      expect(body.message).to.eq('Rota exclusiva para administradores');
    });

    createProduct(payload, undefined, { failOnStatusCode: false }).then(({ status, body }) => {
      expect(status).to.eq(401);
      expect(body.message).to.eq(
        'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais',
      );
    });

    createProduct(payload, admin.token)
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.message).to.eq('Cadastro realizado com sucesso');
        product = { _id: body._id, token: admin.token };

        return getProduct(body._id);
      })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        // The rejected attempts above must not have created anything: the stored product is
        // exactly the administrator's payload.
        expect(body).to.deep.eq({ ...payload, _id: product._id });
      });
  });
});

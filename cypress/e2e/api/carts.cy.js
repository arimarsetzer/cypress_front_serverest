import { cancelCart, createCart, getCart } from '../../support/api/carts';
import { cleanupTestData } from '../../support/api/cleanup';
import { createProduct, getProduct } from '../../support/api/products';
import { createUserWithToken } from '../../support/api/users';
import { buildProduct, buildUser } from '../../support/factories/dataFactory';

describe('API | Carts', () => {
  const initialStock = 5;
  const unitsInCart = 2;
  let admin;
  let customer;
  let product;

  beforeEach(() => {
    createUserWithToken(buildUser({ admin: true })).then((u) => {
      admin = u;
      const payload = buildProduct({ preco: 150, quantidade: initialStock });
      createProduct(payload, admin.token).then(({ body }) => {
        product = { ...payload, _id: body._id, token: admin.token };
      });
    });
    createUserWithToken(buildUser()).then((u) => (customer = u));
  });

  afterEach(() =>
    cleanupTestData({ cartOwners: [customer], products: [product], users: [admin, customer] }),
  );

  it('reserves stock when a cart is created and restores it when the purchase is cancelled', () => {
    createCart([{ idProduto: product._id, quantidade: unitsInCart }], customer.token)
      .then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body.message).to.eq('Cadastro realizado com sucesso');

        return getCart(body._id);
      })
      .then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.idUsuario).to.eq(customer._id);
        expect(body.quantidadeTotal).to.eq(unitsInCart);
        expect(body.precoTotal).to.eq(product.preco * unitsInCart);
        expect(body.produtos).to.deep.eq([
          { idProduto: product._id, quantidade: unitsInCart, precoUnitario: product.preco },
        ]);
      });

    getProduct(product._id)
      .its('body.quantidade')
      .should('eq', initialStock - unitsInCart);

    cancelCart(customer.token).then(({ status, body }) => {
      expect(status).to.eq(200);
      expect(body.message).to.eq(
        'Registro excluído com sucesso. Estoque dos produtos reabastecido',
      );
    });

    getProduct(product._id).its('body.quantidade').should('eq', initialStock);
  });
});

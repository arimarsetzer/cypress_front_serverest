import ShoppingListPage from '../../pages/ShoppingListPage';
import StorePage from '../../pages/StorePage';
import { cleanupTestData } from '../../support/api/cleanup';
import { createProduct } from '../../support/api/products';
import { createUserWithToken } from '../../support/api/users';
import { buildProduct, buildUser } from '../../support/factories/dataFactory';

describe('Frontend | Product search and shopping list', () => {
  let admin;
  let customer;
  let product;

  beforeEach(() => {
    createUserWithToken(buildUser({ admin: true })).then((u) => {
      admin = u;
      const payload = buildProduct({ preco: 123 });
      createProduct(payload, admin.token).then(({ body }) => {
        product = { ...payload, _id: body._id, token: admin.token };
      });
    });
    createUserWithToken(buildUser()).then((u) => (customer = u));
  });

  afterEach(() => cleanupTestData({ products: [product], users: [admin, customer] }));

  it('finds a product by name and totals its price by quantity in the shopping list', () => {
    StorePage.open(customer);
    StorePage.search(product.nome);

    StorePage.productCards().should('have.length', 1);
    StorePage.productCard(product.nome).should('contain.text', `$ ${product.preco}`);

    StorePage.addToShoppingList(product.nome);

    cy.location('pathname').should('eq', '/minhaListaDeProdutos');
    ShoppingListPage.item(product.nome).within(() => {
      cy.get(ShoppingListPage.selectors.itemName).should('have.text', `Produto:${product.nome}`);
      cy.get(ShoppingListPage.selectors.itemQuantity).should('have.text', 'Total: 1');
      cy.contains('p', 'Preço').should('have.text', `Preço R$${product.preco}`);
    });

    ShoppingListPage.increaseQuantity(product.nome);

    ShoppingListPage.item(product.nome).within(() => {
      cy.get(ShoppingListPage.selectors.itemQuantity).should('have.text', 'Total: 2');
      cy.contains('p', 'Preço').should('have.text', `Preço R$${product.preco * 2}`);
    });

    ShoppingListPage.clear();

    cy.get(ShoppingListPage.selectors.emptyMessage).should('have.text', 'Seu carrinho está vazio');
    cy.get(ShoppingListPage.selectors.itemName).should('not.exist');
  });
});

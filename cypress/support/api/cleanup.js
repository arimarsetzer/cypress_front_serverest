import { cancelCart } from './carts';
import { deleteProduct } from './products';
import { deleteUser } from './users';

/**
 * Removes test data in dependency order: the API refuses to delete a product that is in a
 * cart or a user who owns one, so carts go first, then products, then users.
 * Undefined entries are skipped so this is safe to call after a test that failed midway.
 */
export const cleanupTestData = ({ cartOwners = [], products = [], users = [] }) => {
  cartOwners
    .filter(Boolean)
    .forEach((owner) => cancelCart(owner.token, { failOnStatusCode: false }));
  products.filter((p) => p?._id).forEach((p) => deleteProduct(p._id, p.token));
  users.filter((u) => u?._id).forEach((u) => deleteUser(u._id));
};

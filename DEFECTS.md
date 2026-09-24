# Defect Reports

Defects found while exploring and automating [ServeRest Front](https://front.serverest.dev/) and the
[ServeRest API](https://serverest.dev/). Each defect below was reproduced in at least two separate
runs before being filed.

| ID      | Title                                                                | Severity | Priority | Linked test                                   |
| ------- | -------------------------------------------------------------------- | -------- | -------- | --------------------------------------------- |
| DEF-001 | Decreasing the last unit of a shopping list item does not remove it  | Minor    | Medium   | None (area covered by FE-02, not asserted)    |
| DEF-002 | Customers can access the admin area and delete other users' accounts | Critical | High     | None (found during exploration, out of scope) |

Neither defect has an automated `it.skip` regression test. The challenge scope is exactly three
frontend and three API scenarios, so the defects are documented here with manual reproduction
steps and evidence instead of adding extra tests to the suite.

---

## DEF-001: Decreasing the last unit of a shopping list item does not remove it

**Environment**

- Frontend: https://front.serverest.dev (production build `main.63e8c0e3.chunk.js`)
- API: https://serverest.dev (ServeRest 3.2.2)
- Browser: Chrome 153 (headless, Cypress 16.1.0); Windows 10 Home 10.0.19045
- Date: 2026-09-24

**Preconditions**

- A customer account (`administrador: "false"`) is logged in.
- At least one product exists.

**Steps to reproduce**

1. On `/home`, search for the product and click **Adicionar a lista**.
2. On **Lista de Compras** (`/minhaListaDeProdutos`), confirm the item shows `Total: 1`.
3. Click the **-** button on the item.

**Expected result**

The item is removed from the list and the empty-list message **"Seu carrinho está vazio"** is
shown. That is what the page's own logic intends: quantities above 1 are decremented and a
quantity of 1 triggers the removal branch.

**Actual result**

Nothing changes. The item stays in the list with `Total: 1`, and clicking **-** again has no
effect. The `products` entry in `localStorage` still contains the item with `amount: 1`. The only
way to remove it is **Limpar Lista**, which clears the whole list.

**Severity:** Minor. The list cannot be edited as intended, but there is a workaround (clear the
list) and no data outside the browser is affected.

**Priority:** Medium. It affects the main customer shopping journey, and the fix is expected to be
small.

**Rationale**

In the production bundle, the removal function filters list items by `item.id`, but items are
stored with `_id`. The filter therefore never matches, and nothing is removed. This is a likely
root cause for developers to confirm, not a verified diagnosis.

**Evidence**

- [docs/evidence/DEF-001-shopping-list-item-not-removed.png](docs/evidence/DEF-001-shopping-list-item-not-removed.png):
  the list after clicking **-** twice on an item that had quantity 1.
- Reproduced in two separate Cypress runs. Both logged `items: 1, qty: Total: 1, emptyMsg: 0`
  after the clicks.

---

## DEF-002: Customers can access the admin area and delete other users' accounts

**Environment**

Same as DEF-001.

**Preconditions**

- Customer account **A** (`administrador: "false"`) is logged in.
- Another account **B** exists.

**Steps to reproduce**

1. Log in as customer A. The app correctly redirects to `/home`.
2. Navigate directly to `https://front.serverest.dev/admin/home`.
3. Click **Listar Usuários** (`/admin/listarusuarios`).
4. Find account B's row and click **Excluir**.

**Expected result**

Pages under `/admin/*` are only available to administrators. A customer is redirected (for
example to `/home`) or shown an "access denied" message, and cannot list or delete other users.

**Actual result**

- The customer sees the full admin dashboard ("Bem Vindo", with every admin menu entry).
- `/admin/listarusuarios` lists **every** registered user, including their **plaintext
  passwords**.
- Clicking **Excluir** deletes account B. A follow-up `GET /usuarios/{id}` for B returns
  `400 {"message":"Usuário não encontrado"}`.

The frontend route guard only checks whether a token exists in `localStorage`, not the user's
role. The API's `DELETE /usuarios/{id}` requires no authentication, so the backend does not
block the action either.

**Severity:** Critical. Any registered customer can escalate to administrative views, read every
user's credentials and permanently delete other users' accounts.

**Priority:** High. It is a security and data-loss issue that is exposed to every customer.

**Rationale**

Product administration is still protected by the API (it returns 403 for non-admin tokens), so
the impact is concentrated in user management. That part is enough to justify the rating: it
allows account takeover (credentials are visible) and destructive actions against other users.

**Evidence**

- [docs/evidence/DEF-002-customer-on-admin-home.png](docs/evidence/DEF-002-customer-on-admin-home.png):
  a customer session on `/admin/home`.
- [docs/evidence/DEF-002-customer-sees-user-row-with-delete.png](docs/evidence/DEF-002-customer-sees-user-row-with-delete.png):
  the customer session shows another (test) user's row, including the password and the
  **Excluir** action. The screenshot is cropped to that row on purpose: the full page shows data
  belonging to other users of the public environment.
- Reproduced in three separate Cypress runs. Each time the customer reached `/admin/home`, found
  the target user's row and deleted the account, and the API confirmed the deletion.

---

## Observations not filed as defects

These were observed but not filed. Some may be intentional for a training application, some
were not fully confirmed, and some are testability notes rather than product defects.

| Observation                                                                                                                                                                                    | Why it was not filed                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Passwords are exposed in plaintext: in the JWT payload returned by `POST /login`, in `GET /usuarios` and `GET /usuarios/{id}`, and in `localStorage` (`serverest/userPassword`) after sign-up. | Clearly unacceptable in a real product, but it looks like a deliberate simplification of a public training API. DEF-002 is filed because it combines this exposure with a missing authorization check in the frontend. |
| The **Adicionar no carrinho** button declares `data-testid` twice, so the intended `checkout-products` is overwritten by `adicionar carrinho`.                                                 | Testability issue with no user impact. The suite does not use this button.                                                                                                                                             |
| The sign-up success alert has no `role="alert"` (error alerts do).                                                                                                                             | Accessibility note: screen readers may not announce the success message. It also forced a class-based selector in FE-01.                                                                                               |
| `/carrinho` (Carrinho) and `/admin/relatorios` show "Em construção aguarde".                                                                                                                   | Documented as unfinished pages, not defects. Checkout cannot be tested through the UI.                                                                                                                                 |
| After login and sign-up, the frontend downloads the **entire** user list (`GET /usuarios`) to decide where to redirect.                                                                        | Performance and privacy concern; functionally correct.                                                                                                                                                                 |
| Sign-up waits on a fixed 3-second timer before redirecting.                                                                                                                                    | Deliberate UX choice; it only affects test synchronization (handled with a condition-based wait).                                                                                                                      |
| `POST /produtos` accepts and stores an `imagem` field that is not in the Swagger request schema.                                                                                               | Documentation gap rather than a functional defect.                                                                                                                                                                     |
| `GET /produtos/{id}` and `GET /usuarios/{id}` return `400` (not `404`) for unknown IDs.                                                                                                        | Documented in the Swagger contract, so this is expected behavior.                                                                                                                                                      |

## How to report a new defect

1. Reproduce it at least twice, ideally once manually and once in a Cypress run.
2. Add a row to the summary table with the next `DEF-xxx` ID.
3. Copy screenshots into `docs/evidence/`, because `cypress/screenshots/` is gitignored and
   cleared on every run. Crop out any data that does not belong to the test.
4. Fill in every section: environment, preconditions, steps, expected, actual, severity, priority,
   rationale and evidence.

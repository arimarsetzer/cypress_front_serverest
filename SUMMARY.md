# Summary

**Result:** 6 of 6 scenarios (3 frontend E2E and 3 API) passed in 7 consecutive full runs on
Chrome and Electron, with no retries. Two real defects were found and documented, including a
critical authorization defect.

## Approach

1. Explored the application first: the Swagger contract, live API calls, the production
   frontend bundle, and a real browser session. Scenarios were chosen from how the application
   actually behaves, not from assumptions. That is how I found that checkout is not implemented
   in the UI and that the shopping list lives only in `localStorage`.
2. Picked scenarios that complement each other instead of variations of one flow:
   - **Frontend:** customer sign-up (FE-01), product search and shopping list (FE-02), admin
     product registration (FE-03). Together they cover onboarding, shopping and back office.
   - **API:** user registration and login (API-01), role-based product authorization (API-02),
     stock handling in the cart lifecycle (API-03).
3. Used the API to set up and verify the frontend tests: preconditions are created through the
   API, the behavior under test goes through the UI, and the result is confirmed through the API.

## Key design decisions

- **Small Page Object Model.** Each page object holds its selectors and multi-step actions.
  Assertions stay in the specs, and there are no one-line wrapper methods.
- **Plain API helper functions** per resource (`users`, `products`, `carts`) that return
  `cy.request` chains. Status and body assertions live in the spec, so every test reads as
  request followed by expectation.
- **Test independence.** Every test creates its own users and products with unique names, and
  cleans up in `afterEach` in dependency order (cart, then products, then users). Nothing
  depends on pre-existing data or on another test.
- **Three authentication paths**, each chosen for a reason: the real UI login (FE-03), the
  automatic login after sign-up (FE-01), and a token from the API written to `localStorage`
  (FE-02), where login is not what is being tested.
- **Waiting on application behavior.** Tests wait on intercepted requests and location changes.
  There is no `cy.wait(ms)`, and ESLint blocks it.

## Trade-offs

- Known defects are **not** added as `it.skip` tests, to keep the scope at exactly 3+3. They are
  documented with evidence in DEFECTS.md instead.
- No Faker dependency: a 20-line factory generates unique, readable data.
- Assertions check business outcomes (price × quantity, stock reserved and restored, 403 vs 401,
  data persisted through the API), not every field of every response.

## Insights and challenges

- **Shared public environment.** Other people change the data constantly, which pushed the
  design towards unique data, exact-name lookups and strict cleanup.
- **Race condition in the store page.** The initial product load can overwrite search results.
  The suite waits for that load first, which removes a real source of flakiness.
- **Cypress 16 changes.** `Cypress.env()` was removed (replaced by `expose`) and Electron is
  deprecated, so Chrome is the default browser.
- **Windows tooling.** VS Code terminals set `ELECTRON_RUN_AS_NODE=1`, which breaks Cypress. The
  README documents the fix.
- **Most valuable finding.** A customer can open the admin area, see every user's password and
  delete other accounts (DEF-002). It came from exploratory testing guided by reading the
  frontend's route guards.

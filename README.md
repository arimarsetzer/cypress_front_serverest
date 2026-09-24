# cypress_front_serverest

Cypress Open Project for: Front ServeRest

[![Cypress Regression Tests](https://github.com/arimarsetzer/cypress_front_serverest/actions/workflows/e2e.yml/badge.svg)](https://github.com/arimarsetzer/cypress_front_serverest/actions/workflows/e2e.yml)

## Project overview

This is a QA automation challenge solution: **3 frontend E2E scenarios and 3 API scenarios**
written with Cypress and JavaScript, run against ServeRest, a public demo e-commerce
application.

- Frontend under test: https://front.serverest.dev
- API under test (Swagger): https://serverest.dev

| Document                         | Content                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| [SUMMARY.md](SUMMARY.md)         | One-page overview: approach, design decisions, trade-offs   |
| [TEST-REPORT.md](TEST-REPORT.md) | Execution results, stability, flakiness, CI recommendations |
| [DEFECTS.md](DEFECTS.md)         | Defects found, with reproduction steps and evidence         |

## Tech stack

- [Cypress](https://www.cypress.io/) 16 for E2E and API tests
- JavaScript (ES modules in specs, CommonJS for `cypress.config.js`)
- Node.js and npm
- ESLint 10 (flat config) and Prettier 3
- GitHub Actions

## Prerequisites

- **Node.js** `^22.13.0 || >=24`, as set in `engines` in `package.json` (ESLint 10 and
  `eslint-plugin-mocha` require it). Developed with Node 24.11.0 and npm 11.6.1.
- **Google Chrome.** The npm scripts run on Chrome because Cypress 16 deprecates its bundled
  Electron browser. To use another installed browser, pass `-- --browser <name>` (see below).
- Internet access: the tests run against the public ServeRest instances.

## Installation

```bash
npm ci
```

## Running the tests

| Goal                          | Command                                                               |
| ----------------------------- | --------------------------------------------------------------------- |
| Full suite, headless (Chrome) | `npm test`                                                            |
| Full suite, headed            | `npm run test:headed`                                                 |
| Frontend scenarios only       | `npm run test:ui`                                                     |
| API scenarios only            | `npm run test:api`                                                    |
| A single spec                 | `npx cypress run --browser chrome --spec cypress/e2e/api/carts.cy.js` |
| Interactive runner            | `npm run cy:open`                                                     |
| Another browser               | `npm test -- --browser firefox`                                       |

## Project structure

```
cypress.config.js           Base URLs (frontend baseUrl, API through `expose.apiUrl`), timeouts, retries
cypress/
  e2e/
    frontend/               FE-01..FE-03 specs
    api/                    API-01..API-03 specs
  pages/                    Page objects: selectors plus multi-step user actions
  support/
    api/                    Thin cy.request helpers per resource, plus ordered cleanup
    factories/              Unique test data builders (users, products)
    commands.js             cy.visitAuthenticated(): log in by seeding localStorage
docs/evidence/              Defect screenshots and the last run's output
.github/workflows/e2e.yml   CI pipeline
```

## Test scenarios

### Frontend (E2E)

| ID    | Scenario                                                                 | Set up through the API           | Tested through the UI                                            | Verified through the API               |
| ----- | ------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| FE-01 | A new customer signs up and is logged in to the store                    | nothing                          | sign-up form, success alert, redirect to the store, stored token | user persisted as a non-admin          |
| FE-02 | A customer finds a product and the shopping list totals price × quantity | admin, product, customer + token | search, add to list, increase quantity, clear list               | (none: the list is client-side only)   |
| FE-03 | An admin logs in and registers a product                                 | admin user                       | login form, role-based redirect, product form, product table     | product stored with the entered values |

### API

| ID     | Scenario                                                                | Endpoints                                                                                           |
| ------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| API-01 | A registered user can log in and receives a Bearer JWT                  | `POST /usuarios`, `POST /login`, `GET /usuarios/{id}`                                               |
| API-02 | Only authenticated administrators can create products (201 / 403 / 401) | `POST /produtos` (admin, customer, no token), `GET /produtos/{id}`                                  |
| API-03 | Creating a cart reserves stock; cancelling it restores the stock        | `POST /carrinhos`, `GET /carrinhos/{id}`, `GET /produtos/{id}`, `DELETE /carrinhos/cancelar-compra` |

**Skipped tests:** none. The two known defects are documented in [DEFECTS.md](DEFECTS.md) instead
of being added as skipped tests, to keep the suite at exactly 3+3 scenarios.

## Design decisions

- **Page Object Model, kept small.** Page objects centralize selectors and hold only actions with
  several steps or synchronization logic, for example `StorePage.search()` waits for its own
  request. Assertions stay in the specs, and there are no one-line wrapper methods.
- **API abstraction.** One small module per resource with functions that return `cy.request`
  chains. Negative cases pass `{ failOnStatusCode: false }`. Status and body assertions stay
  in the spec.
- **Test data.** Every test builds unique data (`Date.now()` plus a random suffix), because the
  public instance is shared. No fixtures are used, since every value is generated.
- **Cleanup.** `afterEach` cleans up through the API in dependency order (cart, then products,
  then users), because ServeRest refuses to delete a product that is in a cart or a user who owns
  one. It also runs when a test fails.
- **Authentication.** API tokens (JWT, valid for 600 s) are requested per test. The frontend
  keeps its session in `localStorage` (`serverest/userToken`, `serverest/userEmail`), so FE-02
  logs in by seeding those keys. The UI login and sign-up flows are tested in FE-03 and FE-01.
  `cy.session` is not used: every test has its own new user, so there is nothing to reuse.
- **Selectors.** In order of preference: `data-testid`, then ARIA or semantic attributes, then
  text scoped to a unique product name. One exception: the sign-up success alert has no test ID
  or role, so FE-01 uses its `.alert-primary` class.
- **Synchronization.** Tests wait on `cy.intercept` aliases and `cy.location` conditions, never
  on fixed `cy.wait(ms)` delays.
- **Test independence.** Any spec can run alone and in any order.

## Code quality

| Script                 | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm run lint`         | ESLint across the repository                |
| `npm run lint:fix`     | ESLint with automatic fixes                 |
| `npm run format`       | Prettier: rewrite files                     |
| `npm run format:check` | Prettier: fail if any file is not formatted |

Important rules in [eslint.config.mjs](eslint.config.mjs):

- `mocha/no-exclusive-tests`: blocks committed `it.only` / `describe.only`, which would silently
  skip the rest of the suite.
- `mocha/no-identical-title`: blocks duplicate test titles, which make reports ambiguous.
- `eslint-plugin-cypress` recommended rules, including `cypress/no-unnecessary-waiting` (no
  `cy.wait(<ms>)`) and `cypress/unsafe-to-chain-command`.
- `eslint-config-prettier` is applied last, so ESLint never fights Prettier over formatting.
  The two tools run separately.

## Results and artifacts

- Terminal output and a summary table per spec for each run.
- Screenshots of failures: `cypress/screenshots/` (gitignored, cleared on every run; uploaded as
  a CI artifact on failure).
- Videos are disabled (`video: false`) to keep runs fast. Enable them in `cypress.config.js` if
  needed; they go to `cypress/videos/`.
- Evidence from the last run: [docs/evidence/run-summary.txt](docs/evidence/run-summary.txt).
- Defect screenshots: [docs/evidence/](docs/evidence/).

## Continuous integration

[.github/workflows/e2e.yml](.github/workflows/e2e.yml) runs on every push to `main`: install →
lint → format check → Cypress (Chrome, headless) → upload screenshots on failure.

It can also be started manually: **Actions → Cypress Regression Tests → Run workflow**. The `cli`
input replaces the test command, for example:

- `npm run test:api`: API scenarios only
- `npx cypress run --browser chrome --spec cypress/e2e/frontend/signup.cy.js`: one spec
- `npm test -- --browser firefox`: another browser

No secrets are needed, because both URLs are public and set in `cypress.config.js`.

## Limitations

- The tests run against a **shared public environment**. An outage or reset of ServeRest fails
  the suite for reasons unrelated to the code under test.
- **Checkout is not implemented in the UI** (`/carrinho` is "under construction"), so cart rules
  are covered at the API level (API-03).
- See [TEST-REPORT.md](TEST-REPORT.md#known-limitations) for details.

## Troubleshooting

- **Cypress fails with `bad option: --smoke-test` or exits immediately (for example with exit
  code 132) on Windows / VS Code.** The VS Code terminal sets `ELECTRON_RUN_AS_NODE=1`. Clear it
  before running Cypress:
  ```powershell
  Remove-Item Env:ELECTRON_RUN_AS_NODE
  ```
- **`Cypress.env()` was removed in Cypress version 16.0.0.** Read public config values with
  `Cypress.expose('key')` and define them under `expose` in `cypress.config.js`.
- **`npm run format:check` fails on every file on Windows.** With `git config core.autocrlf true`,
  files are checked out with CRLF line endings, but Prettier expects LF. Either set
  `git config core.autocrlf input`, or add a `.gitattributes` with `* text=auto eol=lf`.
- **Chrome not found.** Install Chrome or run with another browser: `npm test -- --browser edge`.

## License

[MIT](LICENSE)

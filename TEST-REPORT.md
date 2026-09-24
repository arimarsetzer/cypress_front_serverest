# Test Execution Report

All numbers below come from real runs on 2026-09-24. The raw output of the last run is saved in
[docs/evidence/run-summary.txt](docs/evidence/run-summary.txt).

## Summary

| Item              | Value                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Date              | 2026-09-24                                                                                                                     |
| Total tests       | 6 (3 frontend E2E + 3 API)                                                                                                     |
| Passed            | 6                                                                                                                              |
| Failed            | 0                                                                                                                              |
| Skipped           | 0 (known defects are documented in [DEFECTS.md](DEFECTS.md), not as skipped tests)                                             |
| Browser           | Chrome 153 and 154 (headless; Chrome auto-updated during the session). Also Electron 146, which Cypress 16 marks as deprecated |
| OS                | Windows 10 Home 10.0.19045                                                                                                     |
| Cypress / Node.js | 16.1.0 / 24.11.0                                                                                                               |
| Duration          | 27–33 s of test time per full run on Chrome; 61–79 s wall-clock with start-up                                                  |
| Retry policy      | `runMode: 1`, `openMode: 0`. **No retries were used in any recorded run**                                                      |
| Environment       | Public shared instances: https://front.serverest.dev and https://serverest.dev                                                 |

## Results per spec (Chrome, four runs)

| ID     | Spec                           | Scenario                                                            | Result     | Duration (run 1 / 2 / 3 / 4) |
| ------ | ------------------------------ | ------------------------------------------------------------------- | ---------- | ---------------------------- |
| FE-01  | `frontend/signup.cy.js`        | New customer signs up and is logged in to the store                 | 4/4 passed | 6 s / 6 s / 7 s / 7 s        |
| FE-02  | `frontend/shopping-list.cy.js` | Customer finds a product and the list totals price by quantity      | 4/4 passed | 5 s / 4 s / 4 s / 6 s        |
| FE-03  | `frontend/admin-product.cy.js` | Admin logs in and registers a product persisted by the API          | 4/4 passed | 8 s / 8 s / 8 s / 10 s       |
| API-01 | `api/users-auth.cy.js`         | Registered user can log in and receives a Bearer JWT                | 4/4 passed | 1 s / 1 s / 1 s / 1 s        |
| API-02 | `api/products.cy.js`           | Only authenticated administrators can create products (201/403/401) | 4/4 passed | 2 s / 2 s / 2 s / 3 s        |
| API-03 | `api/carts.cy.js`              | Creating a cart reserves stock; cancelling it restores the stock    | 4/4 passed | 3 s / 3 s / 4 s / 3 s        |

The FE-01 duration is dominated by the application's fixed 3-second redirect after sign-up.

## Stability

| Browser                 | Full-suite runs        | Result                  | Retries |
| ----------------------- | ---------------------- | ----------------------- | ------- |
| Chrome 153 (headless)   | 3                      | 6/6 passed in every run | 0       |
| Chrome 154 (headless)   | 1 (final evidence run) | 6/6 passed              | 0       |
| Electron 146 (headless) | 3                      | 6/6 passed in every run | 0       |

Results matched across all seven consecutive runs. Run 4 is the one saved in `docs/evidence/run-summary.txt`. After the runs, the shared environment was
checked for leftover data (users, products and carts created by the suite): none was found.

## Known limitations

- **Shared public environment.** Anyone can create, change or delete data on ServeRest at any
  time. The suite never relies on pre-existing records or global counts, but an outage or a
  reset of the public instance would fail every test.
- **No checkout in the UI.** `/carrinho` is marked as under construction, so FE-02 ends at the
  shopping list, which the frontend keeps only in `localStorage`. The server-side cart rules are
  covered by API-03 instead.
- **One class-based selector.** The sign-up success alert has no test ID or ARIA role, so FE-01
  uses the Bootstrap `.alert-primary` class. Product cards and admin table rows have no test IDs
  either; they are located by their unique product name (`cy.contains('.card', name)` and
  `cy.contains('tr', name)`).
- **Two known defects are not covered by automated tests** (see [DEFECTS.md](DEFECTS.md)), to keep
  the suite at exactly three frontend and three API scenarios.

## Observed flakiness

No flaky results were observed in the recorded runs. Three timing risks were found while
building the suite and handled by design, not by retries:

| Risk                                               | Cause                                                                                                                               | Handling                                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Search results overwritten by the full catalogue   | **App**: the store page loads all products on mount. If the search response arrives first, the late full list replaces the results. | `StorePage.open()` waits for the initial `GET /produtos` before searching; `search()` waits for its own request.  |
| Redirect after sign-up arrives about 4 s later     | **App**: fixed `setTimeout(3000)` plus a `GET /usuarios` of every user.                                                             | Condition-based `cy.location(...)` with a 15 s timeout. No fixed `cy.wait`.                                       |
| Data collisions with other users of the public API | **Environment**: shared data.                                                                                                       | Unique timestamp-and-random names and emails; exactly-one-result assertions; `afterEach` cleanup through the API. |

One genuine failure happened during development: FE-01 could not find the sign-up alert through
`[role="alert"]`. It failed on both attempts, so the retry did not hide it. That was a **test**
issue, not flakiness (see below).

## How failures were investigated

1. Read the Cypress error, then the failure screenshot in `cypress/screenshots/`. The screenshot
   showed the redirect had succeeded, so the problem was the alert assertion only.
2. Inspected the production JavaScript bundle and found that success alerts (`alert-primary`)
   have no `role`, while error alerts do.
3. Changed the selector, documented the limitation, and re-ran the spec alone and then the full
   suite.

The same approach (screenshot, network log in the Cypress command log, then the application
source) was used to confirm the two defects in [DEFECTS.md](DEFECTS.md), which were reproduced in
separate runs before being filed.

## CI/CD recommendations

- **Suites.** Tag a smoke subset (API-01 plus FE-03, about 10 s) for every pull request, and run
  the full regression suite on `main` and nightly. `@cypress/grep` tags would allow this without
  splitting folders.
- **Parallelization.** Not worth it for 6 tests (about 30 s). Above about 50 specs, split by spec
  across CI machines. The tests are already independent and create their own data, so they can
  run in parallel safely.
- **Test data.** Keep generating unique data per test. For a real product, use a dedicated
  environment or a local ServeRest container (`npx serverest`) so that runs do not depend on a
  public shared instance.
- **Artifacts.** Upload screenshots on failure, and publish the JUnit report as a check with a
  per-test job summary. Both are already done in `e2e.yml`.
- **Retries.** Keep at most one retry in CI, and report every retried test as flaky. Never raise
  retries to make a red build green.
- **Maintenance.** Ask the frontend team for `data-testid`s on product cards, table rows and
  alerts, and to fix the duplicated `data-testid` on the checkout button.

## Metrics I would track

| Metric                              | Why it matters                                         | Current value (this session)                             |
| ----------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Pass rate per run                   | Overall health of the build                            | 100% (7 of 7 full runs)                                  |
| Flake rate (tests passing on retry) | Trust in the suite; a rising value hides real problems | 0% (0 retries in 42 test executions)                     |
| Duration p50 / p95                  | Feedback speed; catches slow tests before they pile up | 28.5 s / 33 s on Chrome (4 runs; too few for a real p95) |
| Time to triage a failure            | How quickly a red build becomes an actionable ticket   | Not measured yet (needs CI history)                      |
| Defects found by the suite          | Value the automation delivers                          | 0 by the suite; 2 during exploration                     |
| Known-defect tests still skipped    | Open quality debt that must not be forgotten           | 0 (defects are tracked in DEFECTS.md)                    |

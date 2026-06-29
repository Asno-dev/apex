---
name: test-harness
description: >
  Invoke when writing tests, adding test coverage, generating test suites.
  "write tests for", "add coverage", "test generation", "unit tests",
  "integration tests", "test this function".
  SDLC categories: Testing (25 benchmarks).
---

# Test Harness Protocol

1. **RISK MAP** — Identify 3 highest-risk code paths. Risk = (failure probability) × (failure cost)

2. **TEST STRATEGY** per path:
   - Unit: pure functions, utilities, transformations
   - Integration: DB operations, API calls, service interactions
   - E2E: critical user journeys only (login, checkout, core workflow)

3. **QUALITY RULES:**
   - Test behavior, not implementation
   - One assertion per test (or one logical group)
   - Test names: "it should [behavior] when [condition]"
   - No mocking what you own (mock external services only)
   - Arrange-Act-Assert structure, always

4. **For each test:** output failing case first, then passing case. Happy-path-only tests are worth 0.

5. **Output:** Complete test files, runnable with: npm test

---
name: sec-review
description: >
  Invoke when reviewing auth code, input handlers, API routes, session management,
  dependency list. "is this secure", "review for vulnerabilities", "security audit".
  SDLC categories: Vulnerability Detection, Software Maintenance.
---

# Security Review (Vex's OWASP Protocol)

1. **A01** Broken Access Control — every route authz checked?
2. **A02** Cryptographic Failures — secrets in code/logs?
3. **A03** Injection — SQL params? NoSQL? XSS? Command injection?
4. **A04** Insecure Design — threat model applied?
5. **A05** Misconfiguration — CORS wildcard? Debug mode?
6. **A06** Vulnerable Components — npm audit on deps?
7. **A07** Auth & Session — token expiry? Rotation? Scope?
8. **A08** Integrity — CI/CD pipeline security?
9. **A09** Logging — failures logged? Secrets in logs?
10. **A10** SSRF — user-controlled URLs fetched server-side?

**Output:** CRITICAL → HIGH → MEDIUM (severity order, actionable only). Omit LOW.

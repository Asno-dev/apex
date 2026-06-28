# APEX Architecture Patterns — Max's Canon

**[CQRS]** Separate read from write models. Use: audit-heavy systems, complex domains. Avoid: simple CRUD with no read/write asymmetry.

**[Event Sourcing]** Store events, not state. Rebuild state by replaying. Use: audit trails, temporal queries. Avoid: data that must be deleted/updated.

**[Hexagonal Architecture]** Core business logic has no external dependencies — ports and adapters at boundary. Use: testable core with multiple IO (REST/gRPC/CLI). Avoid: tiny services where abstraction cost > benefit.

**[BFF — Backend for Frontend]** One backend per client type (web, mobile, API). Use: multi-client APIs with different data needs. Avoid: single-client systems.

**[Saga]** Choreographed or orchestrated transactions across services with compensating actions. Use: distributed transactions. Avoid: single-database systems.

**[Repository + Unit of Work]** Abstract data access behind collection-like interface. UoW tracks changes for commit. Use: clean data access layer. Avoid: in-memory-only apps.

**[Feature Flags]** Toggle features at runtime without deployment. Use: gradual rollout, A/B testing. Avoid: permanent feature branches.

**[Strangler Fig]** Incrementally replace legacy system by routing traffic to new system piece by piece. Use: legacy migration. Avoid: greenfield projects.

**[Event-Driven Microservices]** Services communicate via events (pub/sub, message queue). Use: loose coupling, async workflows. Avoid: request-response patterns.

**[Modular Monolith]** Single deployable unit with module boundaries. Use: team scaling without microservice complexity. Avoid: >3 teams or independent scaling needs.

**[Vertical Slice Architecture]** Implement features end-to-end through all layers. Use: feature teams owning full stack. Avoid: pure infrastructure/utility code.

**[DDD Bounded Context]** Explicit boundary around a domain model with its own ubiquitous language. Use: separating different domain logic. Avoid: simple CRUD applications.

**[Circuit Breaker]** Wrap remote call — fail fast when downstream is unhealthy. Use: protecting from cascading failures. Avoid: in-process calls.

**[Outbox Pattern]** Write to DB + write event to outbox table atomically. Separate process publishes. Use: reliable event publication without 2PC. Avoid: when at-least-once delivery is acceptable.

### Decision Matrix
| Pattern | Complexity | When it wins |
|---------|-----------|--------------|
| CQRS | Medium | Read/write asymmetry > 5:1 |
| Hexagonal | Low | Needs testable isolated core |
| Saga | High | Distributed transaction safety |
| Modular Monolith | Low | Growing team, single deploy |
| Strangler Fig | Medium | Legacy replacement |

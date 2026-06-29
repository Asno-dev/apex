---
name: system-design
description: >
  Invoke when designing system architecture or technical approach.
  "how should I structure", "design a system for", "architecture for",
  "system design", "technical design".
  SDLC categories: Software Design, Requirement Engineering.
---

# System Design Skill

1. **Requirements extraction** — Scale, constraints, non-functional
2. **Component identification** — 5-7 components max. Each: name + responsibility + interface
3. **Data flow** — Mermaid diagram showing protocol + data shape + direction
4. **Failure analysis** — What happens when each component fails? Top 3 failure modes
5. **Decision log** — Options considered vs chosen, with one-line reason per decision
6. **Scale path** — What breaks at 10x load? First bottleneck?

**Patterns:** CQRS, Event Sourcing, Hexagonal, BFF, Saga, Repository, Feature Flags, Strangler Fig, Modular Monolith, Vertical Slice, DDD, Circuit Breaker, Outbox.

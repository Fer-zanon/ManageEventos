---
applyTo: "src/client/**"
---

# Frontend Development Instructions

Frontend code lives in `src/client`.

---

# Technology Stack

- Angular
- TypeScript
- RxJS
- Component-based architecture

---

# Separation of Concerns

Frontend follows different architecture patterns than backend.

**Do not apply backend rules:**
- No Provider/Repository pattern
- No Domain-Driven Design
- No C# conventions

**Do not generate:**
- C# code
- SQL code
- Backend API logic

---

# API Integration

Communicate with backend through:
- HTTP services
- Generated proxy clients
- DTOs/interfaces matching backend contracts
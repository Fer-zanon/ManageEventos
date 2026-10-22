---
applyTo: "src/database/**"
---

# Database Development Instructions

These instructions apply when generating or modifying SQL database objects.

**DB-First Architecture**: All schema changes must be implemented in the database project.

Critical HIGH-severity rules (must never be violated) and the mandatory self-validation checklist:

- [critical-rules.instructions.md](critical-rules.instructions.md)

---

# Database Rules

All SQL code must follow:

- /docs/rules/database/db-architecture.md
- /docs/rules/database/db-naming.md
- /docs/rules/database/db-views.md
- /docs/rules/database/db-integrity.md

---

# SQL Objects

**Tables:**
- Use proper primary keys
- Define foreign key constraints
- Include appropriate indexes
- Follow naming conventions

**Stored Procedures:**
- Use for complex queries
- Define clear input/output parameters
- Include error handling
- Document purpose

**Views:**
- Abstract complex joins
- Do not use for data modification
- Include column aliases

HIGH-severity view constraints:

- Every table must have a corresponding `<TableName>View` (DB-VIEW-001, DB-NAME-002)
- Views must reference base tables only (no view-on-view) (DB-VIEW-002)

---

# Constraints

Never generate C# code in this context.

Backend integration happens through repositories only.
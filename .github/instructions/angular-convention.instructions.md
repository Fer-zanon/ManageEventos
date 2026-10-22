---
description: "Angular TypeScript code conventions - Quick reference and index"
applyTo: "**/*.ts"
---

# Angular Code Writing Conventions

Angular TypeScript coding conventions for this project, organized by topic.

## Convention Guides

For detailed conventions, see the following specialized guides:

### 📐 [Architecture and Organization](./angular-architecture.instructions.md)

Core structural patterns and conventions:

- Class structure and member ordering (11-level hierarchy)
- File and class naming conventions
- Dependency injection patterns
- Component and service metadata

**Key Topics:** Class organization, naming standards, DI with `inject()`, module configuration

---

### 🎯 [Components and Reactive State](./angular-components.instructions.md)

Component-specific patterns and signal management:

- Signal types (InputSignal, ModelSignal, WritableSignal, computed, effects)
- Constructor initialization order
- Lifecycle hooks
- Template method accessibility
- Component communication patterns

**Key Topics:** Signals, reactive state, component lifecycle, parent-child communication

---

### 🔄 [Services and Data Layer](./angular-services.instructions.md)

Service layer patterns and async operations:

- Three-layer service pattern
- Async/await with Promises
- HTTP client patterns
- State management services
- Error handling in services

**Key Topics:** Service architecture, API integration, async patterns, caching

---

### 📦 [Models and Type Definitions](./angular-models-types.instructions.md)

Data structures and type systems:

- Model classes with factory methods
- Interfaces with `I` prefix
- Enums and type aliases
- Constants organization
- DTO models

**Key Topics:** Domain models, TypeScript types, interfaces, enums, constants

---

### 🛠️ Utilities

Reusable utilities and helpers:

### 🧪 [Pipes](./angular-pipes.instructions.md)

Pipe patterns (pure and impure).

### 🛡️ [Guards](./angular-guards.instructions.md)

Functional guards and route protection patterns.

### ✅ [Validators](./angular-validators.instructions.md)

Custom validators and validation patterns.

**Key Topics:** Pipes, guards, validators, route security

---

### ✅ [Code Quality Standards](./angular-quality.instructions.md)

Quality, maintainability, and best practices:

- Type safety and null handling
- JSDoc documentation patterns
- Code organization and structure
- Error handling
- Performance considerations

**Key Topics:** Type safety, documentation, error handling, performance optimization

---

## Quick Reference

### Most Common Patterns

**Class Member Order:**

1. Public readonly signals → 2. Public writable properties → 3. Private signal backing fields → 4. Private properties → 5. Injected dependencies → 6. Constructor → 7. Lifecycle hooks → 8. Getters/setters → 9. Public methods → 10. Protected methods → 11. Private methods

**Input Signals:**

```typescript
// ✅ Required input - type on property only
readonly userId: InputSignal<number> = input.required();

// ❌ Wrong - redundant type
readonly userId: InputSignal<number> = input.required<number>();
```

**Dependency Injection:**

```typescript
// ✅ Use inject() function
private readonly userService = inject(UserService);

// ❌ Avoid constructor injection
constructor(private userService: UserService) {}
```

**Service Pattern:**

```typescript
// Public method → Client call → Model transformation
async search(filters: Filters): Promise<DtoModel> {
    const response = await this.callClient(filters);
    return this.transformToModel(response);
}
```

**Async Pattern:**

```typescript
// ✅ async/await with Promise
async getData(): Promise<Data> {
    return await lastValueFrom(this.client.getData());
}
```

---

## File Organization

See [angular-architecture.instructions.md](./angular-architecture.instructions.md#naming-conventions) for complete file naming standards.

**Common Patterns:**

- Components: `feature-name.component.ts`
- Services: `feature-name.service.ts`
- Models: `feature-name.model.ts`
- Interfaces: `IFeatureName.ts`
- Guards: `feature-name.guard.ts`
- Pipes: `feature-name.pipe.ts`
- Constants: `feature-name.const.ts`

---
description: "Angular guards: route protection and access control"
applyTo: "**/*.guard.ts"
---

# Angular Guards

Patterns for route guards and access control.

## Functional Guards

Use functional guard approach returning `CanActivateFn`:

```typescript
export function loggedGuard(): CanActivateFn {
  return () => {
    const userService = inject(BasicUserService);
    const router = inject(Router);
    const user = userService.getUser();

    return user ? true : router.createUrlTree(["/login"]);
  };
}

export function notLoggedGuard(): CanActivateFn {
  return () => {
    const userService = inject(BasicUserService);
    const router = inject(Router);
    const user = userService.getUser();

    return !user ? true : router.createUrlTree(["/not-found"]);
  };
}
```

## Role-Based Guards

```typescript
export function adminGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isSystemAdmin()) {
      return true;
    }

    return router.createUrlTree(["/unauthorized"]);
  };
}

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = inject(BasicUserService).getUser();

    if (user && allowedRoles.some(role => user.roles?.includes(role))) {
      return true;
    }

    return router.createUrlTree(["/unauthorized"]);
  };
}
```

## Feature Flag Guards

```typescript
export function featureEnabledGuard(featureName: string): CanActivateFn {
  return () => {
    const featureService = inject(FeatureFlagService);
    const router = inject(Router);

    if (featureService.isEnabled(featureName)) {
      return true;
    }

    return router.createUrlTree(["/not-found"]);
  };
}
```

## Brand-Aware Guards

```typescript
export function brandSelectedGuard(): CanActivateFn {
  return () => {
    const brandService = inject(BrandDefaultConfigService);
    const router = inject(Router);
    const config = brandService.loadConfig();

    if (config.brand) {
      return true;
    }

    return router.createUrlTree(["/select-brand"]);
  };
}
```

## Route Usage

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: "admin",
    canActivate: [loggedGuard(), adminGuard()],
    loadComponent: () => import("./admin/admin.component")
  },
  {
    path: "dashboard",
    canActivate: [loggedGuard(), brandSelectedGuard()],
    loadComponent: () => import("./dashboard/dashboard.component")
  },
  {
    path: "manager",
    canActivate: [loggedGuard(), roleGuard(["manager", "admin"])],
    loadComponent: () => import("./manager/manager.component")
  },
  {
    path: "login",
    canActivate: [notLoggedGuard()],
    loadComponent: () => import("./login/login.component")
  }
];
```

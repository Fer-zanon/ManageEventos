# Test commands, CI, and coverage

Run Angular test commands from `src/client`.

```powershell
# Complete non-watch run
npm test -- --watch=false --browsers=ChromeHeadless

# Selected test entry point
npm test -- --watch=false --browsers=ChromeHeadless --include src/app/path/name.spec.ts

# Coverage report
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

Angular CLI 20.3 exposes all four options. The focused command was also invoked during adoption of this skill. It reached Angular compilation, but unrelated invalid imports in `src/app/utils/color-value.spec.ts` and `src/app/utils/extractErrorMessage.spec.ts` prevented test execution.

`--include` limits Karma's test entry point; it does not guarantee isolated TypeScript compilation because `tsconfig.spec.json` includes all specs. Do not report a selected spec as passing when another spec prevents compilation.

## Current CI status

No Angular client test execution or coverage publication is currently established in the inspected CI configuration. Treat CI enforcement as a planned improvement, not existing protection.

When CI support is added:

1. Run the complete headless suite with the same command developers use locally.
2. Fail on compilation errors, failed tests, focused tests, and browser-launch failures.
3. Produce a machine-readable coverage report and publish it as a build artifact or supported CI report.
4. Exclude generated NSwag output such as `api-proxies-angular.ts`; do not exclude handwritten wrappers, extended clients, guards, interceptors, or Miracle UI integration code.
5. Establish a measured baseline only after the full suite compiles and runs reliably.
6. Introduce thresholds incrementally and prevent regression. Do not invent a percentage without baseline evidence.

Coverage is a gap detector, not the acceptance criterion. Review risk, branch behavior, assertions, and untested boundaries even when a numerical target is met.

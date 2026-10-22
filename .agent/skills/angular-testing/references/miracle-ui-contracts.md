# Testing Miracle UI integration contracts

Miracle UI (`ngx-paradigm-web-ui`) is the real external component library used by the Angular client. Feature tests protect DMS behavior; they do not retest the library.

When implementing or reviewing Miracle UI behavior, also consult the applicable references in the `miracle-ui-components` skill.

## Two test levels

### Feature unit tests

Keep real Miracle UI components when they are lightweight and their public contract is central to the feature. Test only DMS-owned configuration, state, inputs, outputs, and results.

Replace a Miracle UI component when it is expensive or unrelated to the unit. The replacement must preserve the selector and every public input/output used by the behavior under test. Never depend on undocumented internal DOM, CSS classes, or implementation details.

### Focused contract tests

Maintain a small integration-style suite using the real installed library for upgrade-sensitive boundaries:

- grids: columns, stable row identity, row selection, pagination, sorting, empty state, and loading;
- modals and drawers: parameters, confirm, cancel, dismiss, typed result, and single completion;
- selects and typeaheads: DMS model mapping, selection output, empty results, active brand/partner changes, and disabled behavior;
- form controls: model-to-view, view-to-model, touched, disabled, validation display, and submit payload;
- notifications: correct success/error method, safe message, and no success notification after failure.

These tests verify DMS-to-library compatibility, not Miracle UI's internal rendering algorithm.

## Grids

Assert typed grid and column configuration through the DMS public state. For rendered interaction, use the public grid component and its outputs rather than calling a private row handler.

Cover applicable contracts:

- `trackRowByKey` and selection IDs are stable;
- page numbers and page-size changes map correctly to the request;
- sort key and direction map correctly;
- changing filters resets to page 1;
- selection is reconciled when rows are replaced;
- loading and empty state are distinct;
- a later-row action uses that row's identifier, not the first row's value.

Do not test Miracle UI's internal cell markup.

## Modals and drawers

Assert parameters passed to `ModalService` or `DrawerService`, then control the returned observable. Cover confirm, cancel/dismiss (`undefined` where applicable), error retention, double-submit prevention, and close exactly once after success.

When testing the modal component itself, drive its public primary/secondary/dismiss action and assert the typed result. Do not invoke the emitted event and then merely assert that it emitted.

## Selects, typeaheads, and form controls

Follow the installed Miracle UI public API. In particular, not every select is a ControlValueAccessor.

Cover:

- domain value to displayed option;
- user selection to domain value;
- clearing and empty source;
- disabled state;
- touched behavior only for actual CVAs;
- asynchronous search, stale result suppression, and current brand/partner scope;
- no request for input below the configured search threshold, if applicable.

## Notifications and loading

Assert the application service call and message rather than Miracle UI's rendered toast internals. Verify error and success paths are mutually exclusive and loading is released in `finally`.

## Upgrade protection

When the library version changes, run all focused Miracle UI contract tests before broad feature tests. A contract failure should identify whether DMS relies on a changed public API; do not repair it by selecting new undocumented internals.

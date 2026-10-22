# Testing pipes and directives

## Pipes

Instantiate a pure pipe and call `transform()` directly. Use an Angular injection context only when the pipe injects a dependency.

Cover applicable null, undefined, empty, zero, negative, boundary, Unicode, date, and locale cases. Pin `LOCALE_ID` or time when output depends on them. Use literal expected values rather than repeating the pipe algorithm in the test.

Add a host-component test only when template invocation has special behavior, such as arguments from bindings or an impure pipe.

## Directives

Test a directive through a host component containing:

- an element using the normal input;
- applicable default or alternate input;
- an element without the directive as a control.

Dispatch the real host event, update bound signals through the host, and assert the observable host behavior. For structural directives, assert presence and absence and verify that the view reacts after the condition changes.

For browser-resource directives such as blob sources, cover input replacement, load failure where exposed, and cleanup on change and destruction.

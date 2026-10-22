# Testing forms, validators, and custom controls

Test forms at the cheapest level that protects the behavior:

1. validator function;
2. form model and metadata;
3. rendered component and Miracle UI public contract.

## Validators

Call synchronous validators with typed controls. Cover valid values, each invalid rule, exact boundaries, empty-value ownership, and cross-field updates. For asynchronous validators, control the service and time, assert the pending state when meaningful, and cover success and rejection.

## Form models and metadata-driven forms

Verify:

- initial create and edit values;
- conditional visibility and required state;
- disabled/read-only behavior;
- cross-field and business rules;
- transformations such as trimming or null normalization;
- exact transport-shaped submit payload;
- patching an existing model updates all dependent controls;
- media identifiers and dynamically created controls synchronize explicitly;
- reset behavior after success.

Do not assume a hidden field is automatically excluded from a payload; assert the intended request shape.

## Rendered form behavior

Interact through public inputs and DOM events. Cover validation feedback after touch or submit, submit enabled/disabled state, error retention, retry, double-submit prevention, and successful completion.

Use the real Miracle UI control when verifying its DMS integration contract. Otherwise replace it only with a public-contract-compatible stub.

## ControlValueAccessor

Test a custom control through a host with a real `FormControl`. Cover:

- model-to-view;
- view-to-model;
- touched on the correct interaction;
- disabled state;
- repeated writes;
- null/empty values;
- no duplicate change emission.

Do not apply CVA expectations to Miracle UI components whose public contract uses signal inputs and outputs instead; follow the installed library's binding contract.

## Save errors

When save goes through `AwaiterService`, rejection may become `undefined`. Verify the component does not close, clear the form, or show success after failure, and that entered values remain available for correction.

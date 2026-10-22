---
description: "Angular validators: custom form validation patterns"
applyTo: "**/*.ts"
---

# Angular Validators

Patterns for custom form validators and validation logic.

## Custom Form Validators

```typescript
export class CustomValidators {
  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const isLongEnough = value.length >= 8;

      const passwordValid =
        hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLongEnough;

      return !passwordValid ? { strongPassword: true } : null;
    };
  }

  static match(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.errors && !matchingControl.errors["match"]) {
        return null;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ match: true });
        return { match: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }
}
```

## Usage

```typescript
this.form = new FormGroup(
  {
    password: new FormControl("", [Validators.required, CustomValidators.strongPassword()]),
    confirmPassword: new FormControl("", [Validators.required])
  },
  {
    validators: CustomValidators.match("password", "confirmPassword")
  }
);
```

## 2023-10-21 - Added missing accessible names to inputs
**Learning:** Found an accessibility issue pattern where inputs (sliders and text inputs) were missing accessible names. Text next to inputs were using `<span>` instead of semantic `<label>` tags, making them inaccessible to screen readers.
**Action:** Always use `<label>` with `htmlFor` linked to the input's `id`, or add an `aria-label` attribute if a visible label is not desired.

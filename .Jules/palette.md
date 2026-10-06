
## 2023-10-24 - Accessibility Labels on Dashboard Controls
**Learning:** Found an accessibility issue pattern specific to this app's components: range inputs and text inputs were relying solely on adjacent span tags for visual labeling, completely omitting semantic `<label>` associations (`htmlFor`) or `aria-label`s. This made them inaccessible to screen readers.
**Action:** Replaced decorative `<span>` tags with semantic `<label htmlFor="...">` and linked them to their respective input `id`s. Added `aria-label` to inputs missing adjacent text, and `aria-pressed` to custom toggle buttons to convey state.

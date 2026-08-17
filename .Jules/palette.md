## 2024-05-24 - Accessibility Fixes for Range Inputs and Toggles
**Learning:** Found multiple instances where `<span>` elements were used incorrectly as visual labels for inputs without matching `id` and `htmlFor` tags, breaking screen reader associations. Additionally, interactive toggle buttons lacked `aria-pressed` states.
**Action:** Always ensure range sliders, generic inputs, and toggle components include proper semantic `<label>` elements connected via `id`, and state attributes like `aria-pressed` are assigned appropriately to non-traditional toggle controls.

## 2024-10-24 - Accessibility gaps on custom interactive components
**Learning:** Found a pattern where interactive custom UI components like speed toggle buttons used active classes for visual state without `aria-pressed`, and range sliders used disconnected `<span>` elements instead of proper `<label>` elements.
**Action:** Always ensure custom button groups have `aria-pressed` or `aria-selected` attributes and that all form inputs are semantically linked with proper `label` tags and `htmlFor`.

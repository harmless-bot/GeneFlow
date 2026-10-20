## 2024-11-20 - Explicit ARIA labels on disconnected range sliders
**Learning:** In custom config panels where labels and input values are visually structured as siblings but not linked via HTML structure (e.g., using grid/flex layouts without `for`/`id` linking), native screen readers fail to associate the label text with `input[type="range"]`.
**Action:** Always apply `aria-label={label}` directly to the slider component when the visual design deliberately separates the descriptive text from the input control.

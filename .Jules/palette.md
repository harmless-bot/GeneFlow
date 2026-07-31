## 2026-07-31 - Custom Slider Accessibility
**Learning:** In React, custom components acting as inputs (like custom sliders wrapped in standard inputs) often lack explicit label associations. Using `<span>` for labels prevents screen readers from understanding the input's purpose.
**Action:** Always ensure a 1:1 mapping using `<label htmlFor="[id]">` and `id="[id]` on the corresponding input element when implementing configurations, sliders, or other form controls.

## 2026-08-25 - Missing Form Associations in Custom Dashboards
**Learning:** Custom React dashboards often use spans next to inputs instead of semantic `<label>` tags and miss stateful ARIA attributes (like `aria-pressed`) on custom button groups.
**Action:** Always check custom control panels and configuration sidebars for correct `htmlFor` to `id` linkages on sliders/inputs, and ensure custom toggle button groups utilize `aria-pressed` to communicate their state to screen readers.

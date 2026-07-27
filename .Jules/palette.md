## 2024-07-27 - Form Labels and ARIA Attributes
**Learning:** Found that custom inputs (like configuration sliders, terminal inputs, and API key inputs) often lack proper label associations or ARIA attributes in this dashboard app, reducing accessibility for screen reader users.
**Action:** Always ensure `htmlFor` on text labels map to input `id`s and add `aria-label` to icon or standalone inputs.
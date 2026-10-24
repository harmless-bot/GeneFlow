## 2023-10-24 - Semantic Form Labeling & Focus Visible
**Learning:** React inputs without associated labels and interactive elements stripping default outlines (`outline: none`) without providing `:focus-visible` alternatives degrades keyboard navigation.
**Action:** Always map generic wrapper `<span>` tags next to inputs to `<label>` tags linked by `htmlFor`/`id`, and ensure `:focus-visible` is implemented when overriding default focus styling.

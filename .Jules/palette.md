## 2024-05-18 - Missing Accessibility Labels for Inputs
**Learning:** Inputs tied to specific variables often lack a visible `<label>`, breaking keyboard and screen reader accessibility. Ensure `aria-label` or `id` + `<label htmlFor>` is consistently used for text and range inputs.
**Action:** Always add semantic HTML `<label>`s mapped via `htmlFor` or `aria-label` to form inputs during enhancements.

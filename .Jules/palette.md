## 2024-03-24 - Unlabelled Inputs in Configuration Forms
**Learning:** React state-driven range sliders were using styled `<span>` tags instead of semantic `<label>` elements, causing accessibility gaps for screen readers navigating the configuration panel. Similarly, the main terminal and API key inputs lacked ARIA labels.
**Action:** Always link slider or range inputs using `htmlFor` on a `<label>` and `id` on the `<input>`, and ensure any floating or icon-based inputs have an `aria-label`.

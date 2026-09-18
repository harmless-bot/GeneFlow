## 2025-01-22 - Semantic Accessibility Upgrades
**Learning:** React fragments or generic span elements are often used for text labels next to inputs.
**Action:** Always wrap textual descriptions for inputs in semantic `<label>` elements with `htmlFor` linked to the input's `id`. For inputs without explicit text descriptors (like a simple `>` symbol), utilize `aria-label` to provide context for screen readers. For group buttons acting as toggles (e.g. speed selection), apply `aria-pressed` to communicate the active state.

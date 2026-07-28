## 2024-05-18 - [Accessibility for Dashboard Controls]
**Learning:** React range inputs inside mapping functions often lack proper `htmlFor` and `id` linking. Form inputs built for modern UIs sometimes miss screen-reader friendly `aria-label`s for non-standard UI patterns (like terminal inputs).
**Action:** Always verify `htmlFor`/`id` linking for dynamically generated configuration inputs and ensure clear tooltips (`title`) are present for disabled buttons to indicate state.

## 2023-10-25 - React Custom Components Semantic Labels
**Learning:** This application uses many custom React components where standard inputs lack semantic association because generic `<span>` elements were used instead of `<label>`. This results in poor accessibility for screen reader users and affects keyboard accessibility.
**Action:** Always wrap visual text labels accompanying inputs with semantic `<label htmlFor="...">` and ensure the target input has a corresponding `id`. Apply `aria-pressed` for active state toggle buttons.

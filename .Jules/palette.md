## 2026-09-05 - Adding Accessible Labels to Custom Inputs and Groups
**Learning:** Input ranges and custom buttons used for speed controls often lack proper semantic relationships (like `label for=` or `aria-pressed`), hurting screen reader navigation.
**Action:** Always ensure inputs have associated labels via `htmlFor` and use `aria-pressed` for toggle/selection buttons within an `aria-label` grouped element.

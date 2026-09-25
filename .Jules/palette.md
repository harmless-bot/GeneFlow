## 2024-06-11 - Labeling Custom Sliders
**Learning:** In interactive web simulations, range inputs and textual inputs are frequently placed near `<span>` tags acting as visual titles rather than semantic `<label>` tags. This leaves screen readers without a clear context for what the input controls.
**Action:** Use semantic `<label htmlFor="...">` linked to the input's `id` rather than plain `<span>` text for custom UI configuration panels, even if the element doesn't look like a traditional form field. Add `aria-label` when labels are hidden or don't apply.

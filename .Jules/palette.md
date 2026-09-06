
## 2024-09-06 - Replacing unassociated text spans with labels
**Learning:** Found multiple instances where interactive inputs (text fields, ranges) were preceded by visually informative `<span>` elements acting as visual labels but missing programmatic association, making them inaccessible to screen readers.
**Action:** When adding inputs, always use native `<label htmlFor="...">` and pair it with an `id="..."` on the input, even if the label is styled like a regular inline text element.

## 2024-05-24 - Implicit Form Inputs Pattern
**Learning:** Found a recurring pattern in the React components where labels were built using plain `<span>` elements alongside inputs, which breaks screen-reader form association and click-to-focus behavior.
**Action:** Always verify that every custom form field pairs a semantic `<label>` with an explicit `id` on the `<input>`, and map `htmlFor` appropriately, rather than assuming visual proximity implies semantic linkage.


## 2024-05-18 - Semantic Labels in Complex Dashboards
**Learning:** In highly technical interfaces like GeneFlow, many configurations are visually grouped but structurally decoupled from their inputs. Relying purely on visual layout (like placing a text span next to an input) makes navigation extremely difficult for screen readers and breaks clickable area expectations (e.g. users clicking "POPULATION" expect the slider to gain focus).
**Action:** Always wrap descriptive text in a `<label>` and explicitly link it to the adjacent input using `htmlFor` and a corresponding input `id`. Add `aria-pressed` to custom state toggles masquerading as buttons.

## 2024-11-20 - Semantic labels over spans
**Learning:** This app frequently used <span> tags instead of <label> tags for form inputs like API keys, sliders, and terminal inputs, which made accessibility poor as screen readers could not associate labels correctly, and clickable areas were small.
**Action:** Replaced semantic <span> with <label htmlFor="..."> to improve accessibility and make inputs more easily clickable.

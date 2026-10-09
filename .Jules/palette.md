## 2023-10-25 - React Component Purity constraints limit simple UX tweaks
**Learning:** Found pre-existing `react-hooks/purity` ESLint errors caused by `Math.random()` calls directly in the React render body. Fixing these requires moving logic to `useEffect` or `useMemo`, which often exceeds the < 50 lines boundary for simple UX agent PRs.
**Action:** When a project enforces strict React purity, carefully evaluate if resolving pre-existing purity linting errors is worth expanding the scope of the UX PR, or if they should be ignored/left to a dedicated refactoring effort.

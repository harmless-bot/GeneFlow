## 2024-10-17 - Prevent Empty Submissions in Custom Terminal Components
**Learning:** Custom command-line-like terminal interfaces in web apps often neglect standard form validation, allowing empty submissions which can trigger unnecessary API calls or clutter logs.
**Action:** Always ensure that custom terminal input forms have their submit button (`SEND`) disabled when the input value is empty or consists only of whitespace (`!terminalInput.trim()`).

# AI Notes — Smart Expense Tracker API

This document describes how AI tools (specifically Claude / Antigravity AI assistant) were used during the development of this project, what was validated or changed, and what suggestions were rejected.

---

## 1. Which Parts Were AI-Generated vs. Written by Me

### ✅ AI-Generated (scaffolding & boilerplate)

| File | What AI Generated |
|---|---|
| `src/app.js` | Express app setup, CORS middleware wiring, route mounting at `/expenses`, health check `GET /` |
| `src/server.js` | Basic `app.listen()` with `PORT` from `process.env` fallback |
| `src/routes/expenseRoutes.js` | All route definitions (`POST /`, `GET /`, `GET /total`, `GET /summary`, `DELETE /:id`) |
| `src/models/expenseModel.js` | File-based JSON persistence using `fs.readFileSync` / `fs.writeFileSync`, UUID generation via `uuid` package, auto-creation of `expenses.json` if it doesn't exist |
| `package.json` | `start`, `dev` (with `--watch`), and `test` scripts; dependency list (`express`, `cors`, `uuid`, `jest`, `supertest`) |
| `tests/expense.test.js` | Full Jest + Supertest test suite including `beforeEach` reset logic and 8 test cases |

### ✍️ Manually Written / Directed by Me

| Area | What I Did |
|---|---|
| **Controller logic** (`src/controllers/expenseController.js`) | I wrote the validation logic in `addExpense` — specifically checking for `typeof amount !== 'number'` instead of just a truthy check, which the AI initially missed. I also structured each controller function with JSDoc-style comments for clarity. |
| **Monthly summary logic** | The `getMonthlySummary` function's `padStart(2, '0')` for zero-padding months (so `2026-8` becomes `2026-08`) was something I paid close attention to and manually verified was correct. |
| **Category filter** | The `.toLowerCase()` comparison in both `getExpenses` and `getTotalExpenses` was added by me to make filtering case-insensitive — the AI's first version was case-sensitive. |
| **`src/data/expenses.json`** | I manually added 14 diverse sample records covering 6 categories (Food, Transport, Health, Shopping, Entertainment, Utilities) across 3 months (June, July, August 2026) for realistic API testing. |
| **README.md** | Reviewed and confirmed all endpoint documentation matched actual implementation. |

---

## 2. What I Validated, Tested, or Changed in the AI's Output

### 🔍 Validation Step 1 — Amount Type Check
**Problem:** The AI's initial `addExpense` validation was:
```js
if (!title || !amount || !category)
```
This would accept `amount: "500"` (a string), which is wrong — it should only accept numbers.

**Fix I made:**
```js
if (!title || typeof amount !== 'number' || !category)
```
This correctly rejects string amounts and returns a `400` error.

---

### 🔍 Validation Step 2 — Case-Insensitive Category Filter
**Problem:** The AI's first filter was:
```js
expenses.filter(e => e.category === category)
```
This failed when the client sent `?category=food` but data stored `"Food"`.

**Fix I made:**
```js
expenses.filter(e => e.category.toLowerCase() === category.toLowerCase())
```
Applied this to both `getExpenses` and `getTotalExpenses`.

---

### 🔍 Validation Step 3 — Monthly Summary Date Formatting
**Problem:** JavaScript's `getMonth()` returns `0–11`, meaning October = `9`. Without padding, the key would be `"2026-8"` instead of `"2026-08"`.

**What I verified in the AI's code:**
```js
const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
```
The AI did include `padStart(2, '0')` here — I confirmed this was correct by manually running the summary endpoint against dates in June (`2026-06`), July (`2026-07`), and August (`2026-08`) and checking the response keys matched.

---

### 🔍 Validation Step 4 — Test Suite Reset Logic
The AI generated a `beforeEach` that resets the JSON file to `[]` before every test:
```js
beforeEach(() => {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
});
```
I verified this was necessary to prevent test pollution (one test's leftover data affecting the next), and confirmed all 8 tests pass with `npm test`.

---

### 🔍 Validation Step 5 — `--watch` Dev Script
The AI used `node --watch src/server.js` for the `dev` script. I verified this works natively with Node.js v18+ without needing `nodemon`, which kept the dependency list clean.

---

## 3. AI Suggestions I Decided NOT to Use, and Why

### ❌ Suggestion: Use SQLite (via `better-sqlite3`)
The AI initially suggested using an in-memory or file-based SQLite database for persistence. 

**Why I rejected it:** The project requirements explicitly state "no database needed — use a local JSON file." Adding SQLite would have introduced an unnecessary native dependency, complicated setup, and deviated from the spec.

---

### ❌ Suggestion: Use `nodemon` for dev server
The AI suggested adding `nodemon` as a dev dependency for auto-reloading.

**Why I rejected it:** Node.js v18+ supports `node --watch` natively. Using the built-in flag avoids adding a third-party dependency when it isn't needed, keeping `package.json` leaner.

---

### ❌ Suggestion: Separate `validation middleware` file
The AI proposed creating a `src/middleware/validateExpense.js` file to extract validation logic out of the controller.

**Why I rejected it:** For a project of this scope (one resource, one controller), the overhead of a separate middleware file is not justified. The inline validation in `expenseController.js` is simpler, easier to read, and entirely sufficient.

---

### ❌ Suggestion: Return filtered expenses embedded in total response
For `GET /expenses/total`, the AI suggested returning:
```json
{ "total": 1500, "expenses": [...] }
```

**Why I rejected it:** The endpoint is named `/total` — it should return only the total. Including the full expense list in a totals endpoint mixes concerns and could expose more data than the client asked for. I kept the response as `{ "total": <number> }`.

---

## Bonus Feature Implemented

**Monthly Summary Endpoint** — `GET /expenses/summary`

This endpoint was chosen as the bonus feature. It groups all expenses by `YYYY-MM` month key and sums the amounts. 

- Logic is in `expenseController.js → getMonthlySummary()`
- Covered by a dedicated test case in `tests/expense.test.js` (line 71–80)
- Manually tested with sample data spanning June, July, and August 2026

Example response:
```json
{
  "2026-06": 4520,
  "2026-07": 3849,
  "2026-08": 5599
}
```

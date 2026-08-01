# Smart Expense Tracker API

A REST API to manage personal expenses built with Node.js and Express.

## Features Built
- Add an expense (id, title, amount, category, date)
- View all expenses
- Filter expenses by category
- Calculate total expenses (overall and by category)
- Delete an expense
- **Bonus Feature**: Monthly summary endpoint (`GET /expenses/summary`)

## Prerequisites
- Node.js (v14+ recommended)
- npm

## How to Install
Run the following command to install all dependencies:
```bash
npm install
```

## How to Run the Server
Run the following command to start the server:
```bash
npm start
```
The server will run on `http://localhost:3000` by default. 
*(For development with auto-restart, you can run `npm run dev`)*

## How to Run Tests
Run the following command to execute the test suite (uses Jest and Supertest):
```bash
npm test
```
*Note: Running tests will overwrite `src/data/expenses.json` with mock data and clear it during the test suite execution.*

## API Endpoints

- `POST /expenses` - Add an expense
  - Body: `{ "title": "Coffee", "amount": 5, "category": "Food", "date": "2023-10-01T10:00:00Z" }` (Date is optional, defaults to current time)
- `GET /expenses` - View all expenses
  - Query (optional): `?category=Food`
- `GET /expenses/total` - Get total of expenses
  - Query (optional): `?category=Food`
- `GET /expenses/summary` - Get monthly summary of expenses
- `DELETE /expenses/:id` - Delete an expense by ID

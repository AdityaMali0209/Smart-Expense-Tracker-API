const expenseModel = require('../models/expenseModel');

// @desc    Add an expense
// @route   POST /expenses
const addExpense = (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || typeof amount !== 'number' || !category) {
    return res.status(400).json({ error: 'Title, amount (number), and category are required' });
  }

  const newExpense = expenseModel.addExpense({ title, amount, category, date });
  res.status(201).json(newExpense);
};

// @desc    Get all expenses (with optional category filter)
// @route   GET /expenses
const getExpenses = (req, res) => {
  const { category } = req.query;
  let expenses = expenseModel.getAllExpenses();

  if (category) {
    expenses = expenses.filter(expense => expense.category.toLowerCase() === category.toLowerCase());
  }

  res.status(200).json(expenses);
};

// @desc    Calculate total expenses (overall and by category)
// @route   GET /expenses/total
const getTotalExpenses = (req, res) => {
  const { category } = req.query;
  let expenses = expenseModel.getAllExpenses();

  if (category) {
    expenses = expenses.filter(expense => expense.category.toLowerCase() === category.toLowerCase());
  }

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  res.status(200).json({ total });
};

// @desc    Monthly summary endpoint (Bonus)
// @route   GET /expenses/summary
const getMonthlySummary = (req, res) => {
  const expenses = expenseModel.getAllExpenses();
  const summary = {};

  expenses.forEach(expense => {
    // Assuming date is in ISO string or standard format (YYYY-MM-DD...)
    const dateObj = new Date(expense.date);
    const monthYear = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
    
    if (!summary[monthYear]) {
      summary[monthYear] = 0;
    }
    summary[monthYear] += expense.amount;
  });

  res.status(200).json(summary);
};

// @desc    Delete an expense
// @route   DELETE /expenses/:id
const deleteExpense = (req, res) => {
  const { id } = req.params;
  const deleted = expenseModel.deleteExpense(id);

  if (!deleted) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.status(200).json({ message: 'Expense deleted successfully' });
};

module.exports = {
  addExpense,
  getExpenses,
  getTotalExpenses,
  getMonthlySummary,
  deleteExpense
};

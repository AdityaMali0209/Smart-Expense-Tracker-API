const express = require('express');
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getTotalExpenses,
  getMonthlySummary,
  deleteExpense
} = require('../controllers/expenseController');

router.post('/', addExpense);
router.get('/', getExpenses);
router.get('/total', getTotalExpenses);
router.get('/summary', getMonthlySummary);
router.delete('/:id', deleteExpense);

module.exports = router;

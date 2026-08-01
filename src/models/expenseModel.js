const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dataFilePath = path.join(__dirname, '../data/expenses.json');

// Ensure the data file exists, if not, create it with an empty array
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

const readData = () => {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data || '[]');
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

const getAllExpenses = () => {
  return readData();
};

const addExpense = (expenseData) => {
  const expenses = readData();
  const newExpense = {
    id: uuidv4(),
    ...expenseData,
    date: expenseData.date || new Date().toISOString()
  };
  expenses.push(newExpense);
  writeData(expenses);
  return newExpense;
};

const deleteExpense = (id) => {
  const expenses = readData();
  const initialLength = expenses.length;
  const filteredExpenses = expenses.filter(expense => expense.id !== id);
  if (filteredExpenses.length < initialLength) {
    writeData(filteredExpenses);
    return true; // Deleted successfully
  }
  return false; // Not found
};

module.exports = {
  getAllExpenses,
  addExpense,
  deleteExpense
};

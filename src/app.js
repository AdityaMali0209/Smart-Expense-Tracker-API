const express = require('express');
const cors = require('cors');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/expenses', expenseRoutes);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Smart Expense Tracker API is running' });
});

module.exports = app;

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/app');
const dataFilePath = path.join(__dirname, '../src/data/expenses.json');

// Helper to reset data before each test
beforeEach(() => {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
});

describe('Smart Expense Tracker API', () => {

  it('should add a new expense', async () => {
    const res = await request(app).post('/expenses').send({
      title: 'Groceries',
      amount: 50,
      category: 'Food'
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Groceries');
    expect(res.body.amount).toBe(50);
  });

  it('should fail to add an expense without required fields', async () => {
    const res = await request(app).post('/expenses').send({
      title: 'Groceries'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should get all expenses', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'B', amount: 20, category: 'Transport' });

    const res = await request(app).get('/expenses');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(2);
  });

  it('should filter expenses by category', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'B', amount: 20, category: 'Transport' });

    const res = await request(app).get('/expenses?category=Food');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe('Food');
  });

  it('should calculate total expenses', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'B', amount: 20, category: 'Transport' });

    const res = await request(app).get('/expenses/total');
    expect(res.statusCode).toEqual(200);
    expect(res.body.total).toBe(30);
  });

  it('should calculate total expenses by category', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food' });
    await request(app).post('/expenses').send({ title: 'B', amount: 20, category: 'Transport' });

    const res = await request(app).get('/expenses/total?category=Transport');
    expect(res.statusCode).toEqual(200);
    expect(res.body.total).toBe(20);
  });

  it('should get monthly summary', async () => {
    await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food', date: '2023-10-01T10:00:00.000Z' });
    await request(app).post('/expenses').send({ title: 'B', amount: 20, category: 'Transport', date: '2023-10-15T10:00:00.000Z' });
    await request(app).post('/expenses').send({ title: 'C', amount: 30, category: 'Food', date: '2023-11-01T10:00:00.000Z' });

    const res = await request(app).get('/expenses/summary');
    expect(res.statusCode).toEqual(200);
    expect(res.body['2023-10']).toBe(30);
    expect(res.body['2023-11']).toBe(30);
  });

  it('should delete an expense', async () => {
    const postRes = await request(app).post('/expenses').send({ title: 'A', amount: 10, category: 'Food' });
    const id = postRes.body.id;

    const delRes = await request(app).delete(`/expenses/${id}`);
    expect(delRes.statusCode).toEqual(200);

    const getRes = await request(app).get('/expenses');
    expect(getRes.body.length).toBe(0);
  });

  it('should return 404 for non-existent expense deletion', async () => {
    const res = await request(app).delete('/expenses/12345');
    expect(res.statusCode).toEqual(404);
  });

});

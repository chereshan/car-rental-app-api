const express = require('express');
const cors = require('cors');
const path = require('path');

const carsRouter = require('./routes/cars');
const usersRouter = require('./routes/users');
const bookingsRouter = require('./routes/bookings');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/cars', carsRouter);
app.use('/api/users', usersRouter);
app.use('/api/bookings', bookingsRouter);

// Home route
app.get('/', (req, res) => {
  res.send('API для приложения аренды машин (car-rental-app).');
});

// Start server
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../models/database');

// GET /api/bookings
router.get('/', (req, res) => {
  try {
    const db = readDB();
    res.json({
      message: 'Список бронирований успешно получен',
      result: true,
      data: db.bookings
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при чтении базы данных',
      result: false,
      data: null
    });
  }
});

// Остальные маршруты для бронирований...

module.exports = router; 
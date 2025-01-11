const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../models/database');

// GET /api/users
router.get('/', (req, res) => {
  try {
    const db = readDB();
    console.log(`GET /api/users - Успешно получено ${db.users.length} пользователей`);
    res.json({
      message: 'Список пользователей успешно получен',
      result: true,
      data: db.users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Ошибка при чтении базы данных',
      result: false,
      data: null
    });
  }
});


module.exports = router; 
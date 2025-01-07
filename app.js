const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

// Используем порт из переменной окружения для Glitch
const port = process.env.PORT || 3000;

const DB_PATH = './database.json';

// Включаем CORS для всех запросов
app.use(cors());

// Middleware для парсинга JSON
app.use(express.json());
// Middleware для парсинга URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

// Функция для записи данных
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// GET запрос для получения всех машин
app.get('/api/cars', (req, res) => {
  try {
    const db = readDB();
    res.json(db);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при чтении базы данных' });
  }
});

// Простой маршрут
app.get('/', (req, res) => {
  res.send('Простой api для приложения аренды машин (car-rental-app).');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

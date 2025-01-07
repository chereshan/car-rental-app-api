const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const { updateDatabase } = require('./updateDatabase.js');

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

// POST запрос для добавления новой машины
app.post('/api/cars/add', async (req, res) => {
  try {
    const db = readDB();
    const { vin, image } = req.body;
    
    // Проверяем, существует ли машина с таким VIN
    if (db.some(car => car.vin === vin)) {
      return res.status(400).json({ error: 'Машина с таким VIN уже существует' });
    }

    // Получаем детальную информацию по VIN
    const carDetails = await updateDatabase(vin);
    if (!carDetails) {
      return res.status(400).json({ error: 'Не удалось получить информацию по VIN' });
    }

    // Создаем новую запись
    const newCar = {
      id: Math.max(...db.map(car => car.id)) + 1,
      vin: vin,
      model: carDetails.model,
      image: image,
      details: carDetails,
      availableForBooking: true
    };
    
    db.push(newCar);
    writeDB(db);
    
    res.status(201).json(newCar);
  } catch (error) {
    console.error('Ошибка при добавлении машины:', error);
    res.status(500).json({ error: 'Ошибка при добавлении машины' });
  }
});

// DELETE запрос для удаления машины
app.delete('/api/cars/remove/:id', (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id);
    
    const index = db.findIndex(car => car.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Машина не найдена' });
    }
    
    db.splice(index, 1);
    writeDB(db);
    
    res.json({ message: 'Машина успешно удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении машины' });
  }
});

// PUT запрос для обновления машины
app.put('/api/cars/update/:id', (req, res) => {
  try {
    const db = readDB();
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const index = db.findIndex(car => car.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Машина не найдена' });
    }
    
    // Обновляем только те поля, которые пришли в запросе
    const updatedCar = {
      ...db[index],  // Сохраняем все существующие данные
      ...updates,    // Перезаписываем только те поля, которые пришли в updates
      id: id         // Гарантируем, что id не изменится
    };
    
    db[index] = updatedCar;
    writeDB(db);
    
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении машины' });
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

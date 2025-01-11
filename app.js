const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const { checkNHTSA } = require('./checkNHTSA.js');
const path = require('path');

// Используем порт из переменной окружения для Glitch
const port = process.env.PORT || 3000;

const DB_PATH = process.env.PROJECT_DOMAIN ? 
  path.join(__dirname, '.data', 'database.json') : // путь для Glitch
  path.join(__dirname, 'database.json');           // локальный путь

console.log('Current environment:', process.env.PROJECT_DOMAIN ? 'Glitch' : 'Local');
console.log('Database path:', DB_PATH);

// Создаем директорию .data если её нет (только для Glitch)
if (process.env.PROJECT_DOMAIN) {
  try {
    console.log('Creating .data directory if not exists...');
    
    const dataDir = path.join(__dirname, '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log('.data directory created successfully');
    } else {
      console.log('.data directory already exists');
    }

    if (!fs.existsSync(DB_PATH)) {
      console.log('Copying initial database...');
      fs.copyFileSync('./database.json', DB_PATH);
      console.log('Database copied successfully');
    } else {
      console.log('Database file already exists');
    }
  } catch (error) {
    console.error('Error setting up data directory:', error);
  }
}

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
  console.log('GET /api/cars - Получение списка машин');
  try {
    const db = readDB();
    console.log(`GET /api/cars - Успешно получено ${db.length} машин`);
    res.json({
      message: 'Список машин успешно получен',
      result: true,
      data: db
    });
  } catch (error) {
    console.error('GET /api/cars - Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка при чтении базы данных',
      result: false,
      data: null
    });
  }
});

// GET запрос для получения информации по VIN
app.get('/api/cars/vin/:vin', async (req, res) => {
  const vin = req.params.vin;
  const carDetails = await checkNHTSA(vin);
  res.json({
    message: 'Информация по машине успешно получена',
    result: true,
    data: carDetails
  });
});

// POST запрос для добавления новой машины
// если make и model из api = null, то возвращаем ошибку
app.post('/api/cars/add', async (req, res) => {
  console.log('POST /api/cars/add - Попытка добавить машину:', req.body);
  try {
    const db = readDB();
    const { vin, image } = req.body;
    
    if (db.some(car => car.vin === vin)) {
      console.log(`POST /api/cars/add - Машина с VIN ${vin} уже существует`);
      return res.status(400).json({
        message: 'Машина с таким VIN уже существует',
        result: false,
        data: null
      });
    }

    console.log(`POST /api/cars/add - Получение информации по VIN ${vin}`);
    const carDetails = await checkNHTSA(vin);
    if (!carDetails) {
      console.log(`POST /api/cars/add - Не удалось получить информацию по VIN ${vin}`);
      return res.status(400).json({
        message: 'Не удалось получить информацию по VIN',
        result: false,
        data: null
      });
    }

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
    
    console.log(`POST /api/cars/add - Успешно добавлена машина с ID ${newCar.id}`);
    res.status(201).json({
      message: 'Машина успешно добавлена',
      result: true,
      data: newCar
    });
  } catch (error) {
    console.error('POST /api/cars/add - Ошибка:', error);
    res.status(500).json({
      message: 'Ошибка при добавлении машины',
      result: false,
      data: null
    });
  }
});

// DELETE запрос для удаления машины
app.delete('/api/cars/remove/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`DELETE /api/cars/remove/${id} - Попытка удалить машину`);
  try {
    const db = readDB();
    
    const index = db.findIndex(car => car.id === id);
    if (index === -1) {
      console.log(`DELETE /api/cars/remove/${id} - Машина не найдена`);
      return res.status(404).json({
        message: 'Машина не найдена',
        result: false,
        data: null
      });
    }
    
    const removedCar = db.splice(index, 1)[0];
    writeDB(db);
    
    console.log(`DELETE /api/cars/remove/${id} - Машина успешно удалена`);
    res.json({
      message: 'Машина успешно удалена',
      result: true,
      data: removedCar
    });
  } catch (error) {
    console.error(`DELETE /api/cars/remove/${id} - Ошибка:`, error);
    res.status(500).json({
      message: 'Ошибка при удалении машины',
      result: false,
      data: null
    });
  }
});

// PUT запрос для обновления машины
app.put('/api/cars/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`PUT /api/cars/update/${id} - Попытка обновить машину:`, req.body);
  try {
    const db = readDB();
    const updates = req.body;
    
    const index = db.findIndex(car => car.id === id);
    if (index === -1) {
      console.log(`PUT /api/cars/update/${id} - Машина не найдена`);
      return res.status(404).json({
        message: 'Машина не найдена',
        result: false,
        data: null
      });
    }
    
    const updatedCar = {
      ...db[index],
      ...updates,
      id: id
    };
    
    db[index] = updatedCar;
    writeDB(db);
    
    console.log(`PUT /api/cars/update/${id} - Машина успешно обновлена`);
    res.json({
      message: 'Машина успешно обновлена',
      result: true,
      data: updatedCar
    });
  } catch (error) {
    console.error(`PUT /api/cars/update/${id} - Ошибка:`, error);
    res.status(500).json({
      message: 'Ошибка при обновлении машины',
      result: false,
      data: null
    });
  }
});

// Простой маршрут
app.get('/', (req, res) => {
  res.send('Простой API для приложения аренды машин (car-rental-app).');
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});

const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../models/database');
const { checkNHTSA } = require('../utils/checkNHTSA');

// GET /api/cars
router.get('/', (req, res) => {
  console.log('GET /api/cars - Получение списка машин');
  try {
    const db = readDB();
    console.log(`GET /api/cars - Успешно получено ${db.cars.length} машин`);
    res.json({
      message: 'Список машин успешно получен',
      result: true,
      data: db.cars
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
router.get('/vin/:vin', async (req, res) => {
  const vin = req.params.vin;
  const carDetails = await checkNHTSA(vin);
  res.json({
    message: 'Информация по машине успешно получена',
    result: true,
    data: carDetails
  });
});

// POST запрос для добавления новой машины
router.post('/add', async (req, res) => {
  console.log('POST /api/cars/add - Попытка добавить машину:', req.body);
  try {
    const db = readDB();
    const { vin, image, price } = req.body;
    
    if (db.cars.some(car => car.vin === vin)) {
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
      id: Math.max(...db.cars.map(car => car.id)) + 1,
      vin: vin,
      model: carDetails.model,
      image: image,
      details: carDetails,
      price: price
    };
    
    db.cars.push(newCar);
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
router.delete('/remove/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`DELETE /api/cars/remove/${id} - Попытка удалить машину`);
  try {
    const db = readDB();
    
    const index = db.cars.findIndex(car => car.id === id);
    if (index === -1) {
      console.log(`DELETE /api/cars/remove/${id} - Машина не найдена`);
      return res.status(404).json({
        message: 'Машина не найдена',
        result: false,
        data: null
      });
    }
    
    const removedCar = db.cars.splice(index, 1)[0];
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
router.put('/update/:id', (req, res) => {
  const id = parseInt(req.params.id);
  console.log(`PUT /api/cars/update/${id} - Попытка обновить машину:`, req.body);
  try {
    const db = readDB();
    const updates = req.body;
    
    const index = db.cars.findIndex(car => car.id === id);
    if (index === -1) {
      console.log(`PUT /api/cars/update/${id} - Машина не найдена`);
      return res.status(404).json({
        message: 'Машина не найдена',
        result: false,
        data: null
      });
    }
    
    const updatedCar = {
      ...db.cars[index],
      ...updates,
      id: id
    };
    
    db.cars[index] = updatedCar;
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

module.exports = router; 
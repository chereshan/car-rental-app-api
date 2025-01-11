const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.PROJECT_DOMAIN ? 
  path.join(__dirname, '..', '.data', 'database.json') : 
  path.join(__dirname, '..', 'database.json');

console.log('Current environment:', process.env.PROJECT_DOMAIN ? 'Glitch' : 'Local');
console.log('Database path:', DB_PATH);

function readDB() {
  try {
    const rawData = fs.readFileSync(DB_PATH, 'utf8');
    // Проверяем, не является ли строка уже JSON-строкой
    try {
      return JSON.parse(rawData);
    } catch {
      // Если первый парсинг не удался, пробуем распарсить дважды
      return JSON.parse(JSON.parse(rawData));
    }
  } catch (error) {
    console.error('Error reading database:', error);
    throw error;
  }
}

function writeDB(data) {
  // Проверяем, не является ли data уже строкой
  const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  fs.writeFileSync(DB_PATH, jsonData);
}

function resetDB(){
    console.log("DB HARD RESET");
    const data = fs.readFileSync(path.join(__dirname, '..', 'database.json'), 'utf8');
    fs.writeFileSync(DB_PATH, data); // Копируем данные как есть, без дополнительной сериализации
}

module.exports = { readDB, writeDB, resetDB }; 
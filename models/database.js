const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.PROJECT_DOMAIN ? 
  path.join(__dirname, '..', '.data', 'database.json') : 
  path.join(__dirname, '..', 'database.json');

console.log('Current environment:', process.env.PROJECT_DOMAIN ? 'Glitch' : 'Local');
console.log('Database path:', DB_PATH);

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf8');
  return JSON.parse(data);
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function resetDB(){
    const data = fs.readFileSync(path.join(__dirname, '..', 'database.json'), 'utf8');
    writeDB(data);
}


module.exports = { readDB, writeDB, resetDB }; 
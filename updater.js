const { addDatabase } = require('./updateDatabase');
// для генерации случайных VIN используйте https://vingen.ucob.ru/
// для проверки наличия VIN используйте https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/4T1BK1EB1EU175498?format=json
// для изображений поиск гугл руками
// Добавление нового автомобиля
addDatabase(
    '4T1BK1EB1EU175498',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Toyota_Land_Cruiser_%28J12%29_front_20100725.jpg/1024px-Toyota_Land_Cruiser_%28J12%29_front_20100725.jpg'
).then(success => {
    if (success) {
        console.log('Car added successfully');
    } else {
        console.log('Failed to add car');
    }
});
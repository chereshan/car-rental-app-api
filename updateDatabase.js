const fs = require('fs');
const axios = require('axios');

async function addDatabase(vin, imageUrl) {
    try {
        // Читаем текущую базу данных
        const dbPath = './database.json';
        let database = [];
        
        try {
            database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        } catch (error) {
            // Если файл не существует или пустой, создаем новый массив
            console.log('Creating new database file');
        }

        // Проверяем, существует ли уже автомобиль с таким VIN
        if (database.some(car => car.vin === vin)) {
            console.error('Car with this VIN already exists in database');
            return false;
        }

        // Получаем данные от API NHTSA
        const response = await axios.get(
            `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
        );

        const results = response.data.Results;
        
        // Создаем объект с деталями
        const details = {
            make: getValue(results, "Make"),
            manufacturer: getValue(results, "Manufacturer Name"),
            model: getValue(results, "Model"),
            year: getValue(results, "Model Year"),
            plantInfo: {
                city: getValue(results, "Plant City"),
                state: getValue(results, "Plant State"),
                country: getValue(results, "Plant Country"),
                company: getValue(results, "Plant Company Name")
            },
            series: getValue(results, "Series"),
            vehicleType: getValue(results, "Vehicle Type"),
            bodyClass: getValue(results, "Body Class"),
            doors: getValue(results, "Doors"),
            driveType: getValue(results, "Drive Type"),
            engine: {
                cylinders: getValue(results, "Engine Number of Cylinders"),
                displacement: {
                    cc: getValue(results, "Displacement (CC)"),
                    ci: getValue(results, "Displacement (CI)"),
                    l: getValue(results, "Displacement (L)")
                },
                model: getValue(results, "Engine Model"),
                fuelType: getValue(results, "Fuel Type - Primary"),
                configuration: getValue(results, "Engine Configuration"),
                fuelDelivery: getValue(results, "Fuel Delivery / Fuel Injection Type"),
                horsePower: getValue(results, "Engine Brake (hp) From")
            },
            safety: {
                seatBeltType: getValue(results, "Seat Belt Type"),
                airBags: {
                    curtain: getValue(results, "Curtain Air Bag Locations"),
                    front: getValue(results, "Front Air Bag Locations"),
                    knee: getValue(results, "Knee Air Bag Locations"),
                    side: getValue(results, "Side Air Bag Locations")
                },
                tpmsType: getValue(results, "Tire Pressure Monitoring System (TPMS) Type")
            }
        };

        // Очищаем объект от пустых значений
        const cleanDetails = cleanObject(details);

        // Создаем новую запись
        const newCar = {
            id: database.length + 1,
            vin: vin,
            model: `${cleanDetails.make} ${cleanDetails.model}`,
            image: imageUrl,
            details: cleanDetails
        };

        // Добавляем в базу данных
        database.push(newCar);

        // Записываем обновленную базу данных
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
        console.log('Car successfully added to database!');
        return true;

    } catch (error) {
        console.error('Error adding car to database:', error.message);
        return false;
    }
}

// Вспомогательная функция для получения значения из результатов
function getValue(results, variableName) {
    const item = results.find(r => r.Variable === variableName);
    if (!item || item.Value === null || item.Value === "" || item.Value === "Not Applicable") {
        return null;
    }
    return item.Value;
}

// Вспомогательная функция для очистки объекта от null значений
function cleanObject(obj) {
    const cleaned = {};
    
    for (const [key, value] of Object.entries(obj)) {
        if (value === null) continue;
        
        if (typeof value === 'object' && !Array.isArray(value)) {
            const cleanedNested = cleanObject(value);
            if (Object.keys(cleanedNested).length > 0) {
                cleaned[key] = cleanedNested;
            }
        } else {
            cleaned[key] = value;
        }
    }
    
    return cleaned;
}

// Пример использования:
// addDatabase('4T1BF1FK5CU123456', 'https://example.com/car-image.jpg');

module.exports = { addDatabase };
const axios = require('axios');

async function checkNHTSA(vin) {
  try {
    const response = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`);
    const results = response.data.Results;

    // Извлекаем нужные данные из ответа API
    const details = {
      make: results.find(item => item.Variable === "Make")?.Value,
      manufacturer: results.find(item => item.Variable === "Manufacturer Name")?.Value,
      model: results.find(item => item.Variable === "Model")?.Value,
      year: results.find(item => item.Variable === "Model Year")?.Value,
      plantInfo: {
        city: results.find(item => item.Variable === "Plant City")?.Value,
        state: results.find(item => item.Variable === "Plant State")?.Value,
        country: results.find(item => item.Variable === "Plant Country")?.Value,
        company: results.find(item => item.Variable === "Plant Company Name")?.Value
      },
      series: results.find(item => item.Variable === "Series")?.Value,
      vehicleType: results.find(item => item.Variable === "Vehicle Type")?.Value,
      bodyClass: results.find(item => item.Variable === "Body Class")?.Value,
      doors: results.find(item => item.Variable === "Doors")?.Value,
      driveType: results.find(item => item.Variable === "Drive Type")?.Value,
      engine: {
        cylinders: results.find(item => item.Variable === "Engine Number of Cylinders")?.Value,
        displacement: {
          cc: results.find(item => item.Variable === "Displacement (CC)")?.Value,
          ci: results.find(item => item.Variable === "Displacement (CI)")?.Value,
          l: results.find(item => item.Variable === "Displacement (L)")?.Value
        },
        model: results.find(item => item.Variable === "Engine Model")?.Value,
        fuelType: results.find(item => item.Variable === "Fuel Type - Primary")?.Value,
        configuration: results.find(item => item.Variable === "Engine Configuration")?.Value,
        horsePower: results.find(item => item.Variable === "Engine Brake (hp)")?.Value
      },
      safety: {
        seatBeltType: results.find(item => item.Variable === "Seat Belt Type")?.Value,
        airBags: {
          curtain: results.find(item => item.Variable === "Curtain Air Bag Locations")?.Value,
          front: results.find(item => item.Variable === "Front Air Bag Locations")?.Value,
          knee: results.find(item => item.Variable === "Knee Air Bag Locations")?.Value,
          side: results.find(item => item.Variable === "Side Air Bag Locations")?.Value
        },
        tpmsType: results.find(item => item.Variable === "TPMS Type")?.Value
      }
    };

    if (!details.make) {
      return null;
    }

    return details;
  } catch (error) {
    console.error('Error fetching car details:', error);
    return null;
  }
}

module.exports = { checkNHTSA };
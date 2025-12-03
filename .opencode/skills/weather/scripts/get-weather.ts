const city = process.argv[2];
const dateArg = process.argv[3]; // Optional: YYYY-MM-DD format

if (!city) {
  console.error("Usage: npx tsx get-weather.ts <city> [date]");
  console.error("  date: optional, format YYYY-MM-DD (defaults to current weather)");
  process.exit(1);
}

function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    console.error("Invalid date format. Use YYYY-MM-DD");
    process.exit(1);
  }
  return dateStr;
}

async function getWeather(cityName: string, date: string | null) {
  // Geocode city to coordinates
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`
  );
  const geoData = await geoRes.json();

  if (!geoData.results?.length) {
    console.error(`City not found: ${cityName}`);
    process.exit(1);
  }

  const { latitude, longitude, name } = geoData.results[0];

  if (date) {
    // Fetch daily forecast for specific date
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,weather_code&start_date=${date}&end_date=${date}`
    );
    const weather = await weatherRes.json();

    if (!weather.daily?.time?.length) {
      console.error(`No forecast available for date: ${date}`);
      process.exit(1);
    }

    const { temperature_2m_max, temperature_2m_min, wind_speed_10m_max, weather_code } = weather.daily;

    console.log(`Weather forecast for ${name} on ${date}:`);
    console.log(`  Temperature: ${temperature_2m_min[0]}°C - ${temperature_2m_max[0]}°C`);
    console.log(`  Max Wind Speed: ${wind_speed_10m_max[0]} km/h`);
    console.log(`  Condition Code: ${weather_code[0]}`);
  } else {
    // Fetch current weather
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`
    );
    const weather = await weatherRes.json();

    const { temperature_2m, wind_speed_10m, weather_code } = weather.current;

    console.log(`Weather for ${name}:`);
    console.log(`  Temperature: ${temperature_2m}°C`);
    console.log(`  Wind Speed: ${wind_speed_10m} km/h`);
    console.log(`  Condition Code: ${weather_code}`);
  }
}

const date = parseDate(dateArg);
getWeather(city, date);

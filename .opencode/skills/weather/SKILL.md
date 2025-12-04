---
name: weather
description: Fetches current or forecasted weather for a given city using the Open-Meteo API
---

# Weather Skill

Get current weather conditions or forecasts for any city.

## Usage

Run the script with a city name and optional date:

```bash
# Current weather
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London"

# Forecast for a specific date
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London" "2025-12-05"
```

### Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| city | Yes | City name to get weather for |
| date | No | Date in YYYY-MM-DD format for forecast |

## What it returns

### Current weather (no date provided)
- City name
- Temperature (Celsius)
- Wind speed (km/h)
- Weather condition code

### Forecast (with date)
- City name
- Temperature range (min - max in Celsius)
- Max wind speed (km/h)
- Weather condition code

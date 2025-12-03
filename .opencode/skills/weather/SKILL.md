---
name: weather
description: Fetches current weather for a given city using the Open-Meteo API
---

# Weather Skill

Get current weather conditions for any city.

## Usage

Run the script with a city name:

```bash
npx tsx .opencode/skills/weather/scripts/get-weather.ts "London"
```

## What it returns

- City name
- Temperature (Celsius)
- Wind speed (km/h)
- Weather condition code

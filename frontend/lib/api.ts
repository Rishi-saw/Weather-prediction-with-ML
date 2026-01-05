import type { WeatherPrediction, ApiResponse, DailyForecast } from "./types"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

type LiveWeatherResponse = {
  city: string
  country?: string | null
  latitude: number
  longitude: number
  temperature: number | null
  rain_mm: number
  humidity: number
  pressure: number
  wind_speed: number
  clouds: number
  month: number
  day: number
  source: string
  timestamp: string
}

// Generate mock forecast data for 7 days
function generateForecast(baseTemp: number, baseHumidity: number, rainProb: number): DailyForecast[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  
  return days.map((day, index) => {
    const tempVariation = (Math.random() - 0.5) * 6
    const humidityVariation = (Math.random() - 0.5) * 20
    const rainVariation = (Math.random() - 0.5) * 30
    
    const temp = Math.round(baseTemp + tempVariation)
    const humidity = Math.max(0, Math.min(100, Math.round(baseHumidity + humidityVariation)))
    const rain = Math.max(0, Math.min(100, Math.round(rainProb * 100 + rainVariation)))
    
    let condition: string
    if (rain > 70) condition = "Rainy"
    else if (rain > 40) condition = "Cloudy"
    else if (rain > 20) condition = "Partly Cloudy"
    else condition = "Sunny"
    
    return {
      day,
      temperature: temp,
      humidity,
      rainProbability: rain,
      condition,
    }
  })
}

// Map weather condition based on rain prediction and temperature
function getWeatherCondition(rain: string, temperature: number, humidity: number): WeatherPrediction["condition"] {
  if (rain === "Yes") {
    if (humidity > 80) return "Rainy"
    return "Cloudy"
  }
  
  if (temperature > 35) return "Sunny"
  if (humidity > 70) return "Cloudy"
  if (humidity > 50) return "Partly Cloudy"
  return "Sunny"
}

function getConditionFromLive(rainMm: number, clouds: number, temperature: number, humidity: number): WeatherPrediction["condition"] {
  if (rainMm > 5) return "Rainy"
  if (clouds > 70) return "Cloudy"
  if (clouds > 35) return "Partly Cloudy"
  if (humidity > 85) return "Foggy"
  if (temperature > 35) return "Sunny"
  return "Sunny"
}

async function fetchLiveWeather(city: string): Promise<LiveWeatherResponse> {
  const response = await fetch(`${BACKEND_URL}/weather/current?city=${encodeURIComponent(city)}`)
  if (!response.ok) {
    throw new Error(`Live weather error: ${response.status} ${response.statusText}`)
  }
  return await response.json()
}

async function fetchAvailableModelCities(): Promise<Set<string>> {
  const response = await fetch(`${BACKEND_URL}/health`)
  if (!response.ok) return new Set()
  const data = await response.json()
  const cities: string[] = Array.isArray(data?.available_cities) ? data.available_cities : []
  return new Set(cities.map((c) => String(c).toLowerCase()))
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function liveRainChancePercent(live: LiveWeatherResponse): number {
  // Heuristic:
  // - If it's raining now, chance should be high.
  // - Otherwise use clouds + humidity as proxy.
  if (live.rain_mm > 0) return clamp(70 + live.rain_mm * 10, 70, 100)
  return clamp(live.clouds * 0.7 + live.humidity * 0.3, 0, 100)
}

// Get current weather parameters (simulated from historical averages)
// Uses deterministic values based on (date + city) so different locations vary.
function getCurrentWeatherParams(city: string) {
  // Only use Date on client side, use UTC to ensure consistency
  if (typeof window === 'undefined') {
    // Server-side: return default values
    return {
      humidity: 65.0,
      pressure: 1010.0,
      wind_speed: 12.0,
      clouds: 45.0,
      month: 12,
      day: 17,
    }
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()
  
  // Deterministic pseudo-random values based on date + city
  // This keeps values stable per city per day, but different across cities.
  const cityKey = (city || "default").toLowerCase().trim()
  let cityHash = 0
  for (let i = 0; i < cityKey.length; i++) {
    cityHash = (cityHash * 31 + cityKey.charCodeAt(i)) >>> 0
  }
  const seed = (month * 31 + day + (cityHash % 10000)) >>> 0
  const random1 = ((seed * 9301 + 49297) % 233280) / 233280
  const random2 = ((seed * 9301 + 49297 + 1) % 233280) / 233280
  const random3 = ((seed * 9301 + 49297 + 2) % 233280) / 233280
  const random4 = ((seed * 9301 + 49297 + 3) % 233280) / 233280
  
  // Simulate realistic weather parameters based on season
  let baseHumidity: number, basePressure: number, baseWindSpeed: number, baseClouds: number
  
  // Summer months (March-June)
  if (month >= 3 && month <= 6) {
    baseHumidity = 60 + random1 * 20
    basePressure = 1005 + random2 * 10
    baseWindSpeed = 10 + random3 * 15
    baseClouds = 30 + random4 * 30
  }
  // Monsoon (July-September)
  else if (month >= 7 && month <= 9) {
    baseHumidity = 75 + random1 * 20
    basePressure = 995 + random2 * 10
    baseWindSpeed = 15 + random3 * 20
    baseClouds = 60 + random4 * 35
  }
  // Winter (October-February)
  else {
    baseHumidity = 50 + random1 * 25
    basePressure = 1010 + random2 * 10
    baseWindSpeed = 5 + random3 * 10
    baseClouds = 20 + random4 * 30
  }
  
  return {
    humidity: Math.round(baseHumidity * 10) / 10,
    pressure: Math.round(basePressure * 10) / 10,
    wind_speed: Math.round(baseWindSpeed * 10) / 10,
    clouds: Math.round(baseClouds * 10) / 10,
    month,
    day,
  }
}

export async function fetchWeatherPrediction(city: string): Promise<ApiResponse<WeatherPrediction>> {
  try {
    // Prefer live weather parameters (Weather API). If that fails, fall back to simulated params.
    let weatherParams: { humidity: number; pressure: number; wind_speed: number; clouds: number; month: number; day: number }
    let live: LiveWeatherResponse | null = null
    try {
      live = await fetchLiveWeather(city)
      weatherParams = {
        humidity: live.humidity,
        pressure: live.pressure,
        wind_speed: live.wind_speed,
        clouds: live.clouds,
        month: live.month,
        day: live.day,
      }
    } catch {
      weatherParams = getCurrentWeatherParams(city)
    }

    const cityKey = city.toLowerCase().trim()

    // Only use ML for cities where it’s performing well; for others (incl. Mumbai) prefer live weather.
    const ML_STRONG_CITIES = new Set(["kolkata", "delhi"])

    // If we don't have a trained model for this city (or it's not in the strong list), return live weather directly.
    const availableModels = await fetchAvailableModelCities()
    const hasCityModel = availableModels.has(cityKey) || availableModels.has("default")
    const shouldUseMl = hasCityModel && ML_STRONG_CITIES.has(cityKey)

    if ((!shouldUseMl) && live) {
      const baseTemp = live.temperature ?? 25
      const condition = getConditionFromLive(live.rain_mm, live.clouds, baseTemp, live.humidity)
      const rainChance = liveRainChancePercent(live)
      const forecast = generateForecast(baseTemp, live.humidity, rainChance / 100)

      return {
        success: true,
        data: {
          city,
          temperature: Math.round(baseTemp),
          humidity: Math.round(live.humidity),
          rainfall: Math.round(rainChance),
          windSpeed: Math.round(live.wind_speed),
          condition,
          forecast,
          lastUpdated: new Date().toISOString(),
        },
      }
    }
    
    // Add city to the request body for city-specific model
    const requestBody = {
      ...weatherParams,
      city: city, // Send city name to use city-specific ML model
    }
    
    // Call the FastAPI backend
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`)
    }

    const backendData = await response.json()
    
    // Transform backend response to frontend format
    const condition = getWeatherCondition(
      backendData.predicted_rain,
      backendData.predicted_temperature,
      weatherParams.humidity
    )
    
    const forecast = generateForecast(
      backendData.predicted_temperature,
      weatherParams.humidity,
      backendData.rain_probability
    )
    
    const weatherData: WeatherPrediction = {
      city,
      temperature: Math.round(backendData.predicted_temperature),
      humidity: Math.round(weatherParams.humidity),
      // Rain chance as percentage (0-100)
      rainfall: Math.round(clamp(backendData.rain_probability * 100, 0, 100)),
      windSpeed: Math.round(weatherParams.wind_speed),
      condition,
      forecast,
      lastUpdated: new Date().toISOString(),
    }

    return {
      success: true,
      data: weatherData,
    }
  } catch (error) {
    console.error("Error fetching weather prediction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch weather prediction",
    }
  }
}

// Fetch prediction history from backend
export async function fetchPredictionHistory(limit: number = 50) {
  try {
    const response = await fetch(`${BACKEND_URL}/history?limit=${limit}`)
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching history:", error)
    return []
  }
}

// Fetch statistics from backend
export async function fetchStatistics() {
  try {
    const response = await fetch(`${BACKEND_URL}/stats`)
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return null
  }
}

// Health check
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`)
    return response.ok
  } catch (error) {
    return false
  }
}
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function predictWeather(payload: {
  humidity: number;
  pressure: number;
  wind_speed: number;
  clouds: number;
  month: number;
  day: number;
  city?: string;
}) {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Prediction failed");
  return res.json();
}
export async function getAQI(city: string) {
  try {
    const res = await fetch(
      `${BASE_URL}/air-quality?city=${encodeURIComponent(city)}`
    )

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}


export async function get7DayForecast(city: string) {
  const res = await fetch(
    `${BASE_URL}/weather/forecast/7days?city=${city}`
  );
  if (!res.ok) throw new Error("Forecast fetch failed");
  return res.json();
}

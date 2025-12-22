export interface WeatherPrediction {
  city: string
  temperature: number
  humidity: number
  rainfall: number
  windSpeed: number
  condition: WeatherCondition
  forecast: DailyForecast[]
  lastUpdated: string
}

export type WeatherCondition = "Sunny" | "Cloudy" | "Rainy" | "Stormy" | "Snowy" | "Foggy" | "Partly Cloudy"

export interface DailyForecast {
  day: string
  temperature: number
  humidity: number
  rainProbability: number
  condition: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export const INDIAN_CITIES = [
  "Kolkata",
  "Delhi",
  "Mumbai",
  "Ranchi",
  "Patna",
  "Chennai",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Allahabad",
  "Howrah",
  "Gwalior",
  "Jabalpur",
  "Coimbatore",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kochi",
  "Chandigarh",
  "Guwahati",
  "Solapur",
  "Hubli",
  "Tiruchirappalli",
  "Bareilly",
  "Mysore",
  "Tiruppur",
  "Gurgaon",
  "Aligarh",
  "Jalandhar",
  "Bhubaneswar",
  "Salem",
  "Warangal",
  "Guntur",
  "Bhiwandi",
  "Saharanpur",
  "Gorakhpur",
  "Bikaner",
] as const

export type IndianCity = (typeof INDIAN_CITIES)[number]

export const TRENDING_CITIES = ["Kolkata", "Delhi", "Mumbai", "Ranchi", "Patna"] as const

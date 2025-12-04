
export interface WeatherData {
  temperature: number;
  weatherCode: number;
}

export const fetchCoordinates = async (city: string): Promise<{lat: number, lon: number} | null> => {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=sk&format=json`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude
      };
    }
    return null;
  } catch (e) {
    console.warn("Geocoding failed", e);
    return null;
  }
};

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await response.json();
        if (data.current_weather) {
            return {
                temperature: data.current_weather.temperature,
                weatherCode: data.current_weather.weathercode
            };
        }
        return null;
    } catch (e) {
        console.warn("Weather fetch failed", e);
        return null;
    }
};

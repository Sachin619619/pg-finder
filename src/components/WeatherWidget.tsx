"use client";

import { useState, useEffect } from "react";

const weatherData = {
  temp: 28,
  condition: "Partly Cloudy",
  humidity: 65,
  aqi: 42,
  suggestion: "Perfect weather for visiting PGs!",
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(weatherData);

  const getEmoji = (condition: string) => {
    if (condition.includes("Sunny")) return "☀️";
    if (condition.includes("Cloudy")) return "⛅";
    if (condition.includes("Rain")) return "🌧️";
    if (condition.includes("Storm")) return "⛈️";
    return "🌤️";
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return "text-emerald-600 bg-emerald-50";
    if (aqi <= 100) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const aqiColor = getAQIColor(weather.aqi);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Bangalore Weather</p>
          <p className="text-xs text-blue-600 mt-0.5">Good time to go PG hunting!</p>
        </div>
        <span className="text-4xl">{getEmoji(weather.condition)}</span>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-5xl font-bold text-blue-900">{weather.temp}°</span>
        <div className="mb-1">
          <p className="text-sm font-medium text-blue-700">{weather.condition}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-1.5 text-xs text-blue-700">
          <span>💧</span>
          <span>Humidity: {weather.humidity}%</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg ${aqiColor}`}>
          <span>🌿</span>
          <span>AQI: {weather.aqi}</span>
        </div>
      </div>

      <p className="text-xs text-blue-600 mt-3">💡 {weather.suggestion}</p>
    </div>
  );
}

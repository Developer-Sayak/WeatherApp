import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  CloudRain,
  Cloud,
  Snowflake,
  Thermometer,
} from "lucide-react";
import MapComponent from "./components/MapComponent";

const API_KEY = "55501356716e46eda6b192300251507";

const getBackgroundClass = (condition, darkMode) => {
  const base = darkMode ? "dark" : "light";
  if (condition.includes("rain")) return `bg-rain-${base}`;
  if (condition.includes("cloud")) return `bg-cloud-${base}`;
  if (condition.includes("snow")) return `bg-snow-${base}`;
  if (condition.includes("sun") || condition.includes("clear"))
    return `bg-sun-${base}`;
  return `bg-default-${base}`;
};

const iconForCondition = (condition) => {
  condition = condition.toLowerCase();
  if (condition.includes("rain")) return <CloudRain />;
  if (condition.includes("snow")) return <Snowflake />;
  if (condition.includes("cloud")) return <Cloud />;
  if (condition.includes("sun") || condition.includes("clear")) return <Sun />;
  return <Thermometer />;
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("C");
  const [lang, setLang] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = async (query) => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${query}&days=3&aqi=yes&lang=${lang}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setError("");
    } catch (err) {
      setWeather(null);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!city.trim()) {
      setError("Enter a city name");
      return;
    }
    fetchWeather(city);
  };

  // Initial location fetch
  useEffect(() => {
    // Wait 2 seconds after load before requesting location
    const id = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
        (err) => {
          console.warn("Geo denied:", err);
          fetchWeather("London");
        }
      );
    }, 2000);
    return () => clearTimeout(id);
  }, []);

  // Re-fetch weather on language change
  useEffect(() => {
    if (weather) {
      fetchWeather(weather.location.name);
    }
  }, [lang]);

  const conditionText = weather?.current.condition.text.toLowerCase() || "";
  const bgClass = getBackgroundClass(conditionText, darkMode);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div
        className={`min-h-screen p-6 text-white transition-all ${bgClass} dark:bg-gray-900`}
      >
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur rounded-3xl p-6 shadow-xl text-white dark:text-white dark:bg-white/10 relative">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="absolute top-4 right-4 text-white"
          >
            {darkMode ? <Sun /> : <Moon />}
          </button>

          {/* Unit Toggle */}
          <div className="absolute top-4 left-4 text-sm">
            <button
              onClick={() => setUnit(unit === "C" ? "F" : "C")}
              className="bg-white/20 text-white px-3 py-1 rounded-xl hover:bg-white/30 transition"
            >
              {unit === "C" ? "°C → °F" : "°F → °C"}
            </button>
          </div>

          {/* Language Selector */}
          <div className="absolute top-4 left-24 text-sm z-10">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="px-3 py-1 rounded-xl bg-white/30 text-black dark:bg-white/10 dark:text-black backdrop-blur-md shadow-md border-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="en">🇬🇧 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="bn">🇮🇳 বাংলা</option>
              <option value="es">🇪🇸 ES</option>
              <option value="ja">🇯🇵 JA</option>
              <option value="fr">🇫🇷 FR</option>
            </select>
          </div>
          <br />

          <motion.h1
            className="text-3xl font-bold text-center mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Weather Update 🌦️
          </motion.h1>

          {/* Input and Search */}
          <div className="flex gap-2">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl bg-white/20 placeholder-white text-white outline-none focus:ring-2"
              placeholder="Enter city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className={`bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-white/90 transition ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Search
            </button>
          </div>
          <br />
          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
                  setCity(""); // clear city input
                  fetchWeather(coords);
                },
                (err) => {
                  console.error("Geolocation error:", err.message);
                  setError("Unable to fetch your location.");
                  fetchWeather("London");
                }
              );
            }}
            disabled={isLoading}
            className={`bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold hover:bg-white/90 transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Use My Location
          </button>
          {isLoading && (
            <div className="mt-4 flex justify-center">
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-300 mt-4">{error}</p>}

          {/* Weather Info */}
          {weather && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-2xl font-semibold">
                {weather.location.name}, {weather.location.country}
              </h2>
              <p className="text-sm text-white/80">
                {weather.location.localtime}
              </p>

              <div className="flex items-center gap-4 mt-4">
                <div className="text-5xl">
                  {iconForCondition(weather.current.condition.text)}
                </div>
                <div>
                  <p className="text-4xl font-bold">
                    {unit === "C"
                      ? weather.current.temp_c
                      : weather.current.temp_f}
                    °{unit}
                  </p>
                  <p className="capitalize">{weather.current.condition.text}</p>
                  <p>
                    🌅 Sunrise: {weather.forecast.forecastday[0].astro.sunrise}
                  </p>
                  <p>
                    🌇 Sunset: {weather.forecast.forecastday[0].astro.sunset}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-4 text-white/90">
                <p>💧 Humidity: {weather.current.humidity}%</p>
                <p>🌬 Wind: {weather.current.wind_kph} kph</p>
                <p>
                  🔍 AQI:{" "}
                  {weather.current.air_quality.pm2_5?.toFixed(2) ?? "N/A"}
                </p>
                <p>
                  🌡 Feels Like:{" "}
                  {unit === "C"
                    ? weather.current.feelslike_c
                    : weather.current.feelslike_f}
                  °{unit}
                </p>
              </div>

              {/* 3-Day Forecast */}
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">3-Day Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {weather.forecast.forecastday.map((day, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white/20 rounded-xl p-4 flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="font-semibold">{day.date}</p>
                      <div className="text-2xl">
                        {iconForCondition(day.day.condition.text)}
                      </div>
                      <p className="capitalize text-center text-sm">
                        {day.day.condition.text}
                      </p>
                      <p>
                        🌡 {unit === "C" ? day.day.maxtemp_c : day.day.maxtemp_f}
                        ° /{" "}
                        {unit === "C" ? day.day.mintemp_c : day.day.mintemp_f}°
                        {unit}
                      </p>
                      <p className="text-xs mt-2">
                        🌅 {day.astro.sunrise} | 🌇 {day.astro.sunset}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Weather Alerts */}
              {weather.alerts?.alert?.length > 0 && (
                <div className="mt-6 bg-red-500/80 p-4 rounded-xl text-white">
                  <h3 className="text-xl font-semibold mb-2">
                    ⚠️ Weather Alerts
                  </h3>
                  {weather.alerts.alert.map((alert, index) => (
                    <div key={index} className="mb-3">
                      <p className="font-bold">{alert.headline}</p>
                      <p className="text-sm">{alert.desc}</p>
                      <p className="text-xs mt-1 opacity-80">
                        🕒 {alert.effective} → {alert.expires}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Map */}
              <MapComponent
                lat={weather.location.lat}
                lon={weather.location.lon}
                city={weather.location.name}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WeatherWidget = ({ coordinates, locationName, startDate, endDate }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchWeather = async () => {
      if (!coordinates || coordinates.length !== 2 || coordinates[0] === 0 || coordinates[1] === 0) {
        setError('Invalid coordinates provided.');
        return;
      }

      setLoading(true);
      try {
        const [lng, lat] = coordinates;
        const params = { lat, lng };
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        }
        console.log('Fetching weather with params:', params); // Debug log
        const response = await axios.get('http://localhost:3000/api/bookings/weather', { 
          params,
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } // Add JWT token
        });
        setWeatherData(response.data.current);
        setForecastData(response.data.forecast);
        setError(null);
        setRetryCount(0);
      } catch (err) {
        console.error('Fetch weather error:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in again.');
        } else if (err.response?.status === 404 && retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 2000);
        } else {
          setError(err.response?.status === 404
            ? 'Weather service not found. Please contact support.'
            : 'Failed to load weather data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coordinates, startDate, endDate, retryCount]);

  if (loading) return (
    <div className="animate-pulse bg-blue-100 p-4 rounded-lg shadow-md">
      <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-blue-200 rounded w-1/2"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 bg-red-100 rounded-lg">{error}</div>
  );

  if (!weatherData) return null;

  const getWeatherIcon = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-800 flex items-center">
        <span className="mr-2">🌊</span> Weather in {locationName || 'Selected Location'}
      </h3>
      <div className="mt-2">
        <div className="flex items-center space-x-4">
          <img src={getWeatherIcon(weatherData.icon)} alt="Weather icon" className="w-12 h-12" />
          <div>
            <p className="text-xl font-bold text-gray-800">{Math.round(weatherData.temp)}°C</p>
            <p className="text-gray-600 capitalize">{weatherData.description}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Wind: {weatherData.wind_speed} m/s | Humidity: {weatherData.humidity}%
        </p>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-blue-700">Forecast</h4>
        <div className="flex space-x-2 overflow-x-auto py-2">
          {forecastData.map((day, index) => (
            <div key={index} className="flex-shrink-0 bg-blue-50 p-2 rounded-md text-center w-24">
              <p className="text-xs font-medium text-gray-800">
                {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
              <img src={getWeatherIcon(day.icon)} alt="Forecast icon" className="w-8 h-8 mx-auto" />
              <p className="text-sm text-gray-800">{Math.round(day.temp)}°C</p>
              <p className="text-xs text-gray-600 capitalize">{day.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
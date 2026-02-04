import React, { useState, useEffect } from 'react';
import { Cloud, MapPin, Droplets, Thermometer, Wind, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Weather = () => {
    const [city, setCity] = useState('');
    const [currentWeather, setCurrentWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try to get user's location on initial load
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchWeatherByCoords(latitude, longitude);
                },
                (error) => {
                    console.warn("Location access denied or error:", error);
                    // Fallback to default if location needed
                    fetchWeather('Chennai');
                }
            );
        } else {
            fetchWeather('Chennai');
        }
    }, []);

    const fetchWeatherByCoords = async (lat, lon) => {
        setLoading(true);
        try {
            // Fetch current weather via coords
            const currentResponse = await api.get('/api/weather/current', {
                params: { lat, lon }
            });
            setCurrentWeather(currentResponse.data);

            // Clean up the location name if it has diacritics/unusual formatting
            // This helps with the "spelling" issue user might be seeing
            let locationName = currentResponse.data.location;
            setCity(locationName);

            // Fetch forecast via coords
            const forecastResponse = await api.get('/api/weather/forecast', {
                params: { lat, lon }
            });
            setForecast(forecastResponse.data);

            toast.success('Location detected');
        } catch (error) {
            toast.error('Failed to fetch weather for location');
        } finally {
            setLoading(false);
        }
    };

    const fetchWeather = async (searchCity) => {
        setLoading(true);
        try {
            const queryCity = searchCity || city;
            // Fetch current weather
            const currentResponse = await api.get('/api/weather/current', {
                params: { city: queryCity }
            });
            setCurrentWeather(currentResponse.data);

            // Update city name from API response if it differs (e.g. from coordinates)
            if (currentResponse.data.location) {
                setCity(currentResponse.data.location);
            }

            // Fetch forecast
            const forecastResponse = await api.get('/api/weather/forecast', {
                params: { city: queryCity }
            });
            setForecast(forecastResponse.data);

            toast.success('Weather data updated');
        } catch (error) {
            toast.error('Failed to fetch weather data');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWeather();
    };

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        // Call API with coordinates
                        const currentResponse = await api.get('/api/weather/current', {
                            params: { lat: latitude, lon: longitude }
                        });
                        setCurrentWeather(currentResponse.data);
                        setCity(currentResponse.data.location);

                        const forecastResponse = await api.get('/api/weather/forecast', {
                            params: { lat: latitude, lon: longitude }
                        });
                        setForecast(forecastResponse.data);

                        toast.success('Location updated');
                    } catch (error) {
                        toast.error('Failed to get weather for your location');
                    } finally {
                        setLoading(false);
                    }
                },
                (error) => {
                    toast.error('Location access denied');
                    setLoading(false);
                }
            );
        } else {
            toast.error('Geolocation is not supported by this browser.');
        }
    };

    const getWeatherIcon = (description) => {
        if (description.includes('rain')) return '🌧️';
        if (description.includes('cloud')) return '☁️';
        if (description.includes('clear')) return '☀️';
        if (description.includes('snow')) return '🌨️';
        return '🌤️';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Current weather and forecast data
                </p>
            </div>

            {/* Search */}
            <Card>
                <form onSubmit={handleSearch} className="flex gap-3">
                    <Input
                        type="text"
                        placeholder="Enter city name"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        icon={MapPin}
                        className="flex-1"
                    />
                    <Button type="submit" loading={loading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleLocationClick} disabled={loading}>
                        <MapPin className="h-4 w-4 mr-2" />
                        Locate Me
                    </Button>
                </form>
            </Card>

            {/* Current Weather */}
            {currentWeather && (
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Current Weather
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">{getWeatherIcon(currentWeather.description)}</div>
                            <div>
                                <p className="text-4xl font-bold text-gray-900 dark:text-white">
                                    {currentWeather.temperature.toFixed(1)}°C
                                </p>
                                <p className="text-lg text-gray-600 dark:text-gray-400 capitalize">
                                    {currentWeather.description}
                                </p>
                                {currentWeather.feels_like && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Feels like {currentWeather.feels_like.toFixed(1)}°C
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {currentWeather.location}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-700 dark:text-gray-300">Humidity</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {currentWeather.humidity.toFixed(1)}%
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Cloud className="h-5 w-5 text-blue-600" />
                                    <span className="text-gray-700 dark:text-gray-300">Rain Probability</span>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {currentWeather.rain_probability.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-right text-gray-400 dark:text-gray-500">
                            Data source: OpenWeatherMap • Updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </Card>
            )}

            {/* Forecast */}
            {forecast.length > 0 && (
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        6-Hour Forecast
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {forecast.map((item, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(item.time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                            {item.temperature.toFixed(1)}°C
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1">
                                            {item.description}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-4xl">{getWeatherIcon(item.description)}</div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                            {item.rain_probability.toFixed(0)}% rain
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {!currentWeather && !loading && (
                <Card>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Cloud className="h-16 w-16 mb-4" />
                        <p>Enter a city name to view weather data</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Weather;

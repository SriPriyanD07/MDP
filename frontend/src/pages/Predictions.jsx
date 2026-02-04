import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Predictions = () => {
    const [formData, setFormData] = useState({
        soil_moisture: '',
        temperature: '',
        humidity: '',
        rain_sensor: '0',
        rain_probability: '',
    });
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/api/devices');
            setDevices(response.data);
            if (response.data.length > 0) {
                setSelectedDevice(response.data[0].id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const loadLatestData = async () => {
        if (!selectedDevice) {
            toast.error('Please select a device');
            return;
        }

        try {
            const response = await api.get(`/api/sensors/readings/device/${selectedDevice}`, {
                params: { limit: 1 }
            });

            if (response.data.length > 0) {
                const data = response.data[0];
                setFormData({
                    soil_moisture: data.soil_moisture.toString(),
                    temperature: data.temperature.toString(),
                    humidity: data.humidity.toString(),
                    rain_sensor: data.rain_sensor.toString(),
                    rain_probability: '',
                });
                toast.success('Latest sensor data loaded');
            } else {
                toast.error('No sensor data available');
            }
        } catch (error) {
            toast.error('Failed to load sensor data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/api/predictions/predict', {
                soil_moisture: parseFloat(formData.soil_moisture),
                temperature: parseFloat(formData.temperature),
                humidity: parseFloat(formData.humidity),
                rain_sensor: parseInt(formData.rain_sensor),
                rain_probability: formData.rain_probability ? parseFloat(formData.rain_probability) : null,
            });

            setPrediction(response.data);
            toast.success('Prediction generated successfully');
        } catch (error) {
            toast.error('Failed to generate prediction');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ML Predictions</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Get AI-powered irrigation recommendations
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Sensor Input
                    </h2>

                    <div className="mb-4 flex gap-3">
                        <select
                            value={selectedDevice || ''}
                            onChange={(e) => setSelectedDevice(e.target.value)}
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Select Device</option>
                            {devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.device_name}
                                </option>
                            ))}
                        </select>
                        <Button onClick={loadLatestData} variant="outline">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Soil Moisture (%)"
                            type="number"
                            name="soil_moisture"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.soil_moisture}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Temperature (°C)"
                            type="number"
                            name="temperature"
                            placeholder="-50 to 60"
                            min="-50"
                            max="60"
                            step="0.1"
                            value={formData.temperature}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Humidity (%)"
                            type="number"
                            name="humidity"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.humidity}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rain Sensor
                            </label>
                            <select
                                name="rain_sensor"
                                value={formData.rain_sensor}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="0">No Rain</option>
                                <option value="1">Rain Detected</option>
                            </select>
                        </div>

                        <Input
                            label="Rain Probability (%) - Optional"
                            type="number"
                            name="rain_probability"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.rain_probability}
                            onChange={handleChange}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            loading={loading}
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            Generate Prediction
                        </Button>
                    </form>
                </Card>

                {/* Prediction Result */}
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Prediction Result
                    </h2>

                    {prediction ? (
                        <div className="space-y-6">
                            {/* Decision */}
                            <div className={`p-6 rounded-xl text-center ${prediction.should_irrigate
                                    ? 'bg-success-100 dark:bg-success-900/30'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                }`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Decision</p>
                                <p className={`text-2xl font-bold ${prediction.should_irrigate
                                        ? 'text-success-600'
                                        : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {prediction.should_irrigate ? '✓ IRRIGATE' : '✗ DO NOT IRRIGATE'}
                                </p>
                            </div>

                            {/* Recommendation */}
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recommendation</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">
                                    {prediction.recommendation}
                                </p>
                            </div>

                            {/* Confidence */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Confidence</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {(prediction.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${prediction.confidence * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                                    Reason
                                </p>
                                <p className="text-sm text-blue-800 dark:text-blue-400">
                                    {prediction.reason}
                                </p>
                            </div>

                            {/* Model Info */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <TrendingUp className="h-4 w-4" />
                                <span>
                                    Predicted Class: {prediction.predicted_class === 1 ? 'Irrigate' : 'Don\'t Irrigate'}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Brain className="h-16 w-16 mb-4" />
                            <p>Enter sensor data and generate a prediction</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Predictions;

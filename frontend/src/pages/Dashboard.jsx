import React, { useState, useEffect } from 'react';
import { Droplet, Thermometer, Cloud, CloudRain, Power, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState(null);
    const [pumpStatus, setPumpStatus] = useState(null);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        if (selectedDevice) {
            fetchData();
        }
    }, [selectedDevice]);

    useEffect(() => {
        if (autoRefresh && selectedDevice) {
            const interval = setInterval(fetchData, 10000); // 10 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh, selectedDevice]);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/api/devices');
            setDevices(response.data);
            if (response.data.length > 0) {
                setSelectedDevice(response.data[0].id);
            } else {
                setLoading(false);
            }
        } catch (error) {
            toast.error('Failed to fetch devices');
            setLoading(false);
        }
    };

    const fetchData = async () => {
        if (!selectedDevice) return;

        try {
            // Fetch latest sensor reading
            const sensorResponse = await api.get(`/api/sensors/readings/device/${selectedDevice}`, {
                params: { limit: 1 }
            });

            if (sensorResponse.data.length > 0) {
                setSensorData(sensorResponse.data[0]);
            }

            // Fetch pump status
            const pumpResponse = await api.get(`/api/pump/status/${selectedDevice}`);
            setPumpStatus(pumpResponse.data);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setLoading(false);
        }
    };

    const handlePumpControl = async (action) => {
        try {
            await api.post('/api/pump/control', {
                device_id: selectedDevice,
                action: action,
                manual: true
            });
            toast.success(`Pump turned ${action}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to control pump');
        }
    };

    const handleAutoControl = async () => {
        try {
            const response = await api.post('/api/pump/auto', {
                device_id: selectedDevice
            });
            toast.success(response.data.message);
            fetchData();
        } catch (error) {
            const message = error.response?.data?.detail || 'Failed to execute auto control';
            toast.error(message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Devices Found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Add a device to start monitoring</p>
                <Button onClick={() => window.location.href = '/devices'}>
                    Add Device
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time irrigation monitoring</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Device selector */}
                    <select
                        value={selectedDevice || ''}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.device_name}
                            </option>
                        ))}
                    </select>

                    <Button
                        onClick={fetchData}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Sensor Cards */}
            {sensorData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Soil Moisture */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Soil Moisture</p>
                                <p className="text-3xl font-bold text-primary-600 mt-1">
                                    {sensorData.soil_moisture.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <Droplet className="h-8 w-8 text-primary-600" />
                            </div>
                        </div>
                    </Card>

                    {/* Temperature */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
                                <p className="text-3xl font-bold text-warning-600 mt-1">
                                    {sensorData.temperature.toFixed(1)}°C
                                </p>
                            </div>
                            <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                                <Thermometer className="h-8 w-8 text-warning-600" />
                            </div>
                        </div>
                    </Card>

                    {/* Humidity */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
                                <p className="text-3xl font-bold text-success-600 mt-1">
                                    {sensorData.humidity.toFixed(1)}%
                                </p>
                            </div>
                            <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                                <Cloud className="h-8 w-8 text-success-600" />
                            </div>
                        </div>
                    </Card>

                    {/* Rain Sensor */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Rain Sensor</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">
                                    {sensorData.rain_sensor === 1 ? 'Rain' : 'No Rain'}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <CloudRain className="h-8 w-8 text-blue-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <Card>
                    <p className="text-center text-gray-500 dark:text-gray-400">No sensor data available</p>
                </Card>
            )}

            {/* Pump Control */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pump Status</h2>
                    {pumpStatus && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Current Status:</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${pumpStatus.status === 'on'
                                        ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    {pumpStatus.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">Mode:</span>
                                <span className="text-gray-900 dark:text-white font-medium">
                                    {pumpStatus.mode.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <Button
                                    onClick={() => handlePumpControl('on')}
                                    variant="success"
                                    className="flex-1"
                                    disabled={pumpStatus.status === 'on'}
                                >
                                    <Power className="h-4 w-4 mr-2" />
                                    Turn ON
                                </Button>
                                <Button
                                    onClick={() => handlePumpControl('off')}
                                    variant="danger"
                                    className="flex-1"
                                    disabled={pumpStatus.status === 'off'}
                                >
                                    <Power className="h-4 w-4 mr-2" />
                                    Turn OFF
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Auto Control</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Let AI decide based on sensor data and weather forecast
                    </p>
                    <Button
                        onClick={handleAutoControl}
                        variant="primary"
                        className="w-full"
                    >
                        Run Auto Control
                    </Button>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            💡 Auto control uses ML predictions and weather data to make irrigation decisions
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;

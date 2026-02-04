import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../utils/api';
import toast from 'react-hot-toast';

const History = () => {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [days, setDays] = useState(7);
    const [sensorData, setSensorData] = useState([]);
    const [pumpLogs, setPumpLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDevices();
    }, []);

    useEffect(() => {
        if (selectedDevice) {
            fetchHistoricalData();
        }
    }, [selectedDevice, days]);

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

    const fetchHistoricalData = async () => {
        if (!selectedDevice) return;

        setLoading(true);
        try {
            // Fetch sensor readings
            const sensorResponse = await api.get('/api/sensors/readings/history', {
                params: { device_id: selectedDevice, days }
            });

            // Format data for charts
            const formattedData = sensorResponse.data.map(reading => ({
                timestamp: new Date(reading.timestamp).toLocaleDateString(),
                moisture: reading.soil_moisture,
                temperature: reading.temperature,
                humidity: reading.humidity,
            }));
            setSensorData(formattedData);

            // Fetch pump logs
            const pumpResponse = await api.get('/api/pump/logs', {
                params: { device_id: selectedDevice, days }
            });

            // Format pump logs for timeline
            const pumpTimeline = pumpResponse.data.map(log => ({
                timestamp: new Date(log.timestamp).toLocaleDateString(),
                status: log.pump_status === 'on' ? 1 : 0,
                reason: log.reason,
            }));
            setPumpLogs(pumpTimeline);

        } catch (error) {
            toast.error('Failed to fetch historical data');
        } finally {
            setLoading(false);
        }
    };

    const exportData = () => {
        const csvContent = [
            ['Timestamp', 'Soil Moisture', 'Temperature', 'Humidity'],
            ...sensorData.map(d => [d.timestamp, d.moisture, d.temperature, d.humidity])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `irrigation_history_${days}days.csv`;
        a.click();
        toast.success('Data exported successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">History</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Historical data visualization
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedDevice || ''}
                        onChange={(e) => setSelectedDevice(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="">Select Device</option>
                        {devices.map((device) => (
                            <option key={device.id} value={device.id}>
                                {device.device_name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value={1}>Last 24 hours</option>
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>

                    <Button onClick={exportData} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {loading ? (
                <Card>
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                        Loading historical data...
                    </p>
                </Card>
            ) : sensorData.length > 0 ? (
                <>
                    {/* Soil Moisture Trend */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Soil Moisture Trend
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="moisture"
                                    stroke="#0ea5e9"
                                    strokeWidth={2}
                                    name="Soil Moisture (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Temperature & Humidity */}
                    <Card>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            Temperature & Humidity Trends
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={sensorData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="timestamp" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="temperature"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    name="Temperature (°C)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="humidity"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Humidity (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* Pump Activity Timeline */}
                    {pumpLogs.length > 0 && (
                        <Card>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                Pump Activity Timeline
                            </h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={pumpLogs}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="timestamp" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px'
                                        }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                                                        <p className="text-white font-medium">
                                                            {payload[0].payload.timestamp}
                                                        </p>
                                                        <p className="text-sm text-gray-300 mt-1">
                                                            Status: {payload[0].value === 1 ? 'ON' : 'OFF'}
                                                        </p>
                                                        {payload[0].payload.reason && (
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                {payload[0].payload.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="status"
                                        fill="#10b981"
                                        name="Pump Status (1=ON, 0=OFF)"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    )}
                </>
            ) : (
                <Card>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Calendar className="h-16 w-16 mb-4" />
                        <p>No historical data available</p>
                        <p className="text-sm mt-2">Select a device to view history</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default History;

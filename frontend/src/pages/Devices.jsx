import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, MapPin, Leaf, Cpu, X } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Devices = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [formData, setFormData] = useState({
        device_name: '',
        location: '',
        crop_type: '',
        moisture_threshold: '40',
    });

    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await api.get('/api/devices');
            setDevices(response.data);
        } catch (error) {
            toast.error('Failed to fetch devices');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingDevice) {
                await api.put(`/api/devices/${editingDevice.id}`, {
                    ...formData,
                    moisture_threshold: parseFloat(formData.moisture_threshold),
                });
                toast.success('Device updated successfully');
            } else {
                await api.post('/api/devices', {
                    ...formData,
                    moisture_threshold: parseFloat(formData.moisture_threshold),
                });
                toast.success('Device added successfully');
            }

            setShowModal(false);
            setEditingDevice(null);
            setFormData({
                device_name: '',
                location: '',
                crop_type: '',
                moisture_threshold: '40',
            });
            fetchDevices();
        } catch (error) {
            const message = error.response?.data?.detail || 'Operation failed';
            toast.error(message);
        }
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        setFormData({
            device_name: device.device_name,
            location: device.location,
            crop_type: device.crop_type,
            moisture_threshold: device.moisture_threshold.toString(),
        });
        setShowModal(true);
    };

    const handleDelete = async (deviceId) => {
        if (!window.confirm('Are you sure you want to delete this device? All associated data will be removed.')) {
            return;
        }

        try {
            await api.delete(`/api/devices/${deviceId}`);
            toast.success('Device deleted successfully');
            fetchDevices();
        } catch (error) {
            toast.error('Failed to delete device');
        }
    };

    const handleToggleActive = async (device) => {
        try {
            await api.put(`/api/devices/${device.id}`, {
                is_active: !device.is_active
            });
            toast.success(`Device ${!device.is_active ? 'activated' : 'deactivated'}`);
            fetchDevices();
        } catch (error) {
            toast.error('Failed to update device status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devices</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your irrigation devices
                    </p>
                </div>

                <Button onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                </Button>
            </div>

            {/* Devices Grid */}
            {loading ? (
                <Card>
                    <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                        Loading devices...
                    </p>
                </Card>
            ) : devices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <Card key={device.id}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${device.is_active
                                            ? 'bg-success-100 dark:bg-success-900/30'
                                            : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                        <Cpu className={`h-6 w-6 ${device.is_active ? 'text-success-600' : 'text-gray-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">
                                            {device.device_name}
                                        </h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${device.is_active
                                                ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}>
                                            {device.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(device)}
                                        className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(device.id)}
                                        className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                    <span>{device.location}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Leaf className="h-4 w-4" />
                                    <span>{device.crop_type}</span>
                                </div>

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Moisture Threshold
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {device.moisture_threshold}%
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => handleToggleActive(device)}
                                    variant={device.is_active ? 'secondary' : 'success'}
                                    size="sm"
                                    className="w-full mt-4"
                                >
                                    {device.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Cpu className="h-16 w-16 mb-4" />
                        <p>No devices found</p>
                        <p className="text-sm mt-2">Add your first irrigation device</p>
                    </div>
                </Card>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md" hover={false}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {editingDevice ? 'Edit Device' : 'Add New Device'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingDevice(null);
                                    setFormData({
                                        device_name: '',
                                        location: '',
                                        crop_type: '',
                                        moisture_threshold: '40',
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form on Submit={handleSubmit} className="space-y-4">
                            <Input
                                label="Device Name"
                                type="text"
                                name="device_name"
                                placeholder="Garden Sprinkler"
                                value={formData.device_name}
                                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                                required
                            />

                            <Input
                                label="Location"
                                type="text"
                                name="location"
                                placeholder="Front Garden"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />

                            <Input
                                label="Crop Type"
                                type="text"
                                name="crop_type"
                                placeholder="Tomatoes"
                                value={formData.crop_type}
                                onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                                required
                            />

                            <Input
                                label="Moisture Threshold (%)"
                                type="number"
                                name="moisture_threshold"
                                placeholder="40"
                                min="0"
                                max="100"
                                step="1"
                                value={formData.moisture_threshold}
                                onChange={(e) => setFormData({ ...formData, moisture_threshold: e.target.value })}
                                required
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingDevice(null);
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                >
                                    {editingDevice ? 'Update' : 'Add'} Device
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Devices;

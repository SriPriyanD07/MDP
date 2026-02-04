import React, { useState, useEffect } from 'react';
import { Moon, Sun, User, Mail, Lock, Info } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme) => {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
        toast.success(`Switched to ${newTheme} mode`);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();

        // Validation
        if (passwordForm.newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // In a real app, this would call an API endpoint
        toast.success('Password changed successfully');
        setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account and preferences
                </p>
            </div>

            {/* User Profile */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    User Profile
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                            <User className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                            <p className="font-medium text-gray-900 dark:text-white">{user?.username}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full">
                            <Mail className="h-6 w-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Appearance */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Appearance
                </h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <Moon className="h-6 w-6 text-primary-600" />
                        ) : (
                            <Sun className="h-6 w-6 text-warning-600" />
                        )}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className={`
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors
              ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}
            `}
                    >
                        <span
                            className={`
                inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}
              `}
                        />
                    </button>
                </div>
            </Card>

            {/* Change Password */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Change Password
                </h2>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <Input
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                    />

                    <Input
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        icon={Lock}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                    />

                    <Button type="submit" variant="primary">
                        Update Password
                    </Button>
                </form>
            </Card>

            {/* Default Settings */}
            <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Default Settings
                </h2>

                <div className="space-y-4">
                    <Input
                        label="Default Moisture Threshold (%)"
                        type="number"
                        placeholder="40"
                        min="0"
                        max="100"
                        defaultValue="40"
                    />

                    <Input
                        label="Rain Probability Threshold (%)"
                        type="number"
                        placeholder="30"
                        min="0"
                        max="100"
                        defaultValue="30"
                    />

                    <Button variant="primary">
                        Save Settings
                    </Button>
                </div>
            </Card>

            {/* About */}
            <Card>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Info className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            About Smart Irrigation
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                            AI-powered irrigation management system
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Version 1.0.0 • Built with React, FastAPI, and Machine Learning
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;

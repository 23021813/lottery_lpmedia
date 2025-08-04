import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { saveTimeSettings, getTimeSettings } from '../services/mockApi';

export const TimeSettings: React.FC = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const loadSettings = async () => {
        const currentSettings = await getTimeSettings();
        if (currentSettings) {
            setStartTime(currentSettings.regStart);
            setEndTime(currentSettings.regEnd);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveTimeSettings({ regStart: startTime, regEnd: endTime });
            setSaveMessage('Lưu cài đặt thành công!');
            // Force reload settings from file to confirm persistence
            setTimeout(async () => {
                await loadSettings();
            }, 1000);
        } catch (error) {
            setSaveMessage('Lỗi khi lưu cài đặt.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };
    
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 text-slate-800">Cài Đặt Thời Gian</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="start-time" className="block text-sm font-medium text-slate-600 mb-1">Thời gian bắt đầu</label>
                    <Input 
                        id="start-time"
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div>
                     <label htmlFor="end-time" className="block text-sm font-medium text-slate-600 mb-1">Thời gian kết thúc</label>
                    <Input 
                        id="end-time"
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} isLoading={isSaving}>
                    Lưu Cài Đặt
                </Button>
            </div>
            {saveMessage && (
                <p className="text-center text-sm text-green-600 mt-2">{saveMessage}</p>
            )}
        </Card>
    );
};
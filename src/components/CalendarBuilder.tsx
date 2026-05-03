'use client';

import React, { useState } from 'react';
import { Calendar } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CalendarBuilder({
  calendar,
  onUpdate,
}: {
  calendar: Calendar;
  onUpdate: (c: Calendar) => void;
}) {
  const [saving, setSaving] = useState(false);
  
  // We parse the existing calendar_layout if it exists, otherwise use defaults
  const [config, setConfig] = useState(() => {
    let defaultLayout = {
      preset: 'classic', // classic, seatwise, daily
      shape: 'rounded', // rounded, square, pill
      primaryColor: '#4f46e5',
      bgColor: '#ffffff',
      textColor: '#0f172a',
    };
    if ((calendar as any).calendar_layout) {
      try {
        defaultLayout = { ...defaultLayout, ...JSON.parse((calendar as any).calendar_layout) };
      } catch (e) {}
    }
    return defaultLayout;
  });

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/calendars/${calendar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendar_layout: JSON.stringify(config),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save');
      }
      onUpdate({ ...calendar, calendar_layout: JSON.stringify(config) } as any);
      alert('Calendar design saved!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Calendar Builder</h3>
            <p className="text-sm text-slate-500 mb-4">Customize how the booking widget looks and behaves for your customers.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Layout Preset</label>
              <select 
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={config.preset}
                onChange={e => updateConfig('preset', e.target.value)}
              >
                <option value="classic">Classic Calendar (1:1 / Consulting)</option>
                <option value="seatwise">Seat-wise (Tattoo / Salon / Classes)</option>
                <option value="daily">Daily Rental (Scooters / Equipment)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Widget Shape</label>
              <select 
                className="w-full rounded-md border border-slate-300 p-2 text-sm"
                value={config.shape}
                onChange={e => updateConfig('shape', e.target.value)}
              >
                <option value="rounded">Rounded Corners (Modern)</option>
                <option value="square">Square (Sharp/Edgy)</option>
                <option value="pill">Pill (Friendly)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={config.primaryColor}
                  onChange={e => updateConfig('primaryColor', e.target.value)}
                  className="h-8 w-8 rounded border-0 p-0"
                />
                <input 
                  type="text" 
                  value={config.primaryColor}
                  onChange={e => updateConfig('primaryColor', e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 p-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Background Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={config.bgColor}
                  onChange={e => updateConfig('bgColor', e.target.value)}
                  className="h-8 w-8 rounded border-0 p-0"
                />
                <input 
                  type="text" 
                  value={config.bgColor}
                  onChange={e => updateConfig('bgColor', e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 p-1 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Text Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={config.textColor}
                  onChange={e => updateConfig('textColor', e.target.value)}
                  className="h-8 w-8 rounded border-0 p-0"
                />
                <input 
                  type="text" 
                  value={config.textColor}
                  onChange={e => updateConfig('textColor', e.target.value)}
                  className="flex-1 rounded-md border border-slate-300 p-1 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Calendar Design'}
            </Button>
          </div>
        </Card>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-2">
        <div 
          className="w-full h-full min-h-[500px] flex items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl"
          style={{ backgroundColor: '#f8fafc' }}
        >
          {/* Mock Calendar Widget */}
          <div 
            className="w-full max-w-md shadow-xl overflow-hidden transition-all duration-300"
            style={{ 
              backgroundColor: config.bgColor, 
              color: config.textColor,
              borderRadius: config.shape === 'square' ? '0' : config.shape === 'pill' ? '24px' : '12px'
            }}
          >
            <div className="p-6 border-b" style={{ borderColor: `${config.textColor}20` }}>
              <h2 className="text-xl font-bold" style={{ color: config.textColor }}>
                {calendar.name}
              </h2>
              <p className="text-sm opacity-70 mt-1">
                {config.preset === 'seatwise' ? 'Select your seat & time' : 
                 config.preset === 'daily' ? 'Select rental dates' : 'Select a Date & Time'}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Calendar Grid Mock */}
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {['S','M','T','W','T','F','S'].map(d => (
                  <div key={d} className="font-semibold opacity-50">{d}</div>
                ))}
                {Array.from({length: 31}).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square flex items-center justify-center cursor-pointer transition-colors ${i === 14 ? 'font-bold shadow-md' : 'hover:opacity-70 opacity-90'}`}
                    style={{
                      backgroundColor: i === 14 ? config.primaryColor : 'transparent',
                      color: i === 14 ? '#fff' : config.textColor,
                      borderRadius: config.shape === 'square' ? '0' : config.shape === 'pill' ? '50%' : '8px'
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Time/Seat Slots Mock */}
              <div className="space-y-2">
                <div className="text-sm font-medium opacity-70">
                  {config.preset === 'seatwise' ? 'Available Seats' : 
                   config.preset === 'daily' ? 'Available Equipment' : 'Available Times'}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 AM', '10:00 AM', '01:00 PM', '02:00 PM'].map((t, i) => (
                    <div 
                      key={t}
                      className="border py-2 text-center text-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ 
                        borderColor: `${config.textColor}30`,
                        borderRadius: config.shape === 'square' ? '0' : config.shape === 'pill' ? '9999px' : '6px',
                        backgroundColor: i === 0 ? config.primaryColor : 'transparent',
                        color: i === 0 ? '#fff' : config.textColor
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

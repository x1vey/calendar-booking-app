'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Rule {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityEditor({ calendarId }: { calendarId: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchRules() {
      try {
        const res = await fetch(`/api/admin/calendars/${calendarId}/rules`);
        if (res.ok) {
          const data = await res.json();
          setRules(data);
        }
      } catch (err) {
        console.error('Failed to load rules:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, [calendarId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/calendars/${calendarId}/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rules),
      });
      if (res.ok) {
        alert('Availability saved!');
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save');
      }
    } catch (err: any) {
      alert(`Error saving availability: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addRule = (day: number) => {
    setRules([...rules, { day_of_week: day, start_time: '09:00', end_time: '17:00' }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof Rule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const copyToAll = (dayIndex: number) => {
    const rulesToCopy = rules.filter(r => r.day_of_week === dayIndex);
    const otherRules = rules.filter(r => r.day_of_week === dayIndex); // (wait, just filter all days)
    
    let newRules: Rule[] = [];
    for (let i = 0; i < 7; i++) {
        rulesToCopy.forEach(r => {
            newRules.push({ ...r, day_of_week: i });
        });
    }
    setRules(newRules);
    alert('Copied to all days!');
  };

  const setAllDay = (dayIndex: number) => {
    // Remove all rules for this day and add one 00:00-23:59 rule
    const filtered = rules.filter(r => r.day_of_week !== dayIndex);
    setRules([...filtered, { day_of_week: dayIndex, start_time: '00:00', end_time: '23:59' }]);
  };

  const excludeDay = (dayIndex: number) => {
    setRules(rules.filter(r => r.day_of_week !== dayIndex));
  };

  return (
    <Card className="p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900">Weekly Availability</h3>
          <p className="text-sm text-slate-500">Define your working hours. Bookings can only happen during these windows.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-lg">
           {/* Global controls could go here if needed */}
        </div>
      </div>

      <div className="space-y-2">
        {DAYS.map((dayName, dayIndex) => {
          const dayRules = rules.filter(r => r.day_of_week === dayIndex);
          const isUnavailable = dayRules.length === 0;

          return (
            <div key={dayName} className={`group flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-8 p-6 rounded-2xl transition-all ${isUnavailable ? 'bg-slate-50/50 grayscale' : 'bg-white border border-slate-100 shadow-sm'}`}>
              <div className="w-32 pt-2">
                <span className={`text-sm font-bold ${isUnavailable ? 'text-slate-400' : 'text-slate-900'}`}>{dayName}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                {isUnavailable ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Unavailable</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => addRule(dayIndex)}>Enable</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rules.map((rule, idx) => rule.day_of_week === dayIndex && (
                      <div key={idx} className="flex items-center space-x-3 animate-fade-in">
                        <input
                          type="time"
                          value={rule.start_time.substring(0, 5)}
                          onChange={(e) => updateRule(idx, 'start_time', e.target.value)}
                          className="rounded-lg border-slate-200 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        />
                        <span className="text-slate-400 font-bold">—</span>
                        <input
                          type="time"
                          value={rule.end_time.substring(0, 5)}
                          onChange={(e) => updateRule(idx, 'end_time', e.target.value)}
                          className="rounded-lg border-slate-200 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500 py-1.5"
                        />
                        <button 
                          onClick={() => removeRule(idx)} 
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remove range"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-4 pt-2">
                        <button onClick={() => addRule(dayIndex)} className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center uppercase tracking-widest">
                           <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                           Add Range
                        </button>
                    </div>
                  </div>
                )}
              </div>

              {!isUnavailable && (
                <div className="flex flex-col sm:flex-row items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => copyToAll(dayIndex)}>Copy to All</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => setAllDay(dayIndex)}>All Day</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 text-rose-500 hover:bg-rose-50" onClick={() => excludeDay(dayIndex)}>Exclude</Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-400 italic">
          Pro-tip: Adding multiple ranges lets you "block" time (e.g. lunch break).
        </p>
        <Button onClick={handleSave} disabled={saving} size="lg">
           {saving ? 'Saving...' : 'Save Availability'}
        </Button>
      </div>
    </Card>
  );
}

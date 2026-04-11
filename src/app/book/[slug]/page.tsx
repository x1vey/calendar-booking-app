'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarType, AvailableSlot } from '@/lib/types';
import { TIMEZONES } from '@/lib/timezone';

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || searchParams.get('utm_source') || '';
  
  const [calendar, setCalendar] = useState<CalendarType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookerTimezone, setBookerTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [step, setStep] = useState<'date' | 'slot' | 'form'>('date');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const res = await fetch(`/api/calendar-meta/${slug}`);
        if (!res.ok) throw new Error('Calendar not found');
        const data = await res.json();
        setCalendar(data);
      } catch (err: any) {
        setError(err.message || 'Calendar not found');
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, [slug]);

  const fetchSlots = async (date: Date) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots/${slug}?date=${format(date, 'yyyy-MM-dd')}&timezone=${bookerTimezone}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
      setStep('slot');
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarSlug: slug,
          bookerName: formData.name,
          bookerEmail: formData.email,
          bookerTimezone,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = `/book/${slug}/confirmed?id=${data.booking.id}`;
    } catch (err: any) {
      alert(err.message);
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!calendar) return <div className="flex items-center justify-center min-h-screen">Calendar not found</div>;

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
        
        {/* Left Side: Calendar Info */}
        <div className="w-full md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">
              {calendar.name[0]}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{calendar.name}</h1>
            <div className="flex items-center text-slate-500 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {calendar.slot_duration_minutes} min
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {calendar.description}
            </p>
            
            <div className="pt-8">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Display Timezone</label>
               <select 
                className="w-full text-xs font-medium text-slate-600 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                value={bookerTimezone}
                onChange={(e) => setBookerTimezone(e.target.value)}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right Side: Step through flow */}
        <div className="w-full md:w-2/3 p-8">
           {step === 'date' && (
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Select a Date</h2>
                  <div className="flex space-x-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 text-sm font-semibold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 text-sm font-semibold">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
               </div>
               
               <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                  ))}
               </div>

               <div className="grid grid-cols-7 gap-1">
                  {/* Padding for first day */}
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="h-12" />
                  ))}
                  {days.map(day => {
                    const isPassed = isBefore(day, startOfDay(new Date()));
                    return (
                      <button
                        key={day.toString()}
                        disabled={isPassed}
                        onClick={() => {
                          setSelectedDate(day);
                          fetchSlots(day);
                        }}
                        className={`h-12 flex items-center justify-center rounded-xl text-sm transition-all ${
                          isSameDay(day, selectedDate!) 
                            ? 'bg-indigo-600 text-white font-bold' 
                            : isPassed 
                              ? 'text-slate-300 pointer-events-none'
                              : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 font-medium'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
               </div>
             </div>
           )}

           {step === 'slot' && (
             <div className="space-y-6">
                <button onClick={() => setStep('date')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Back to Calendar
                </button>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">{format(selectedDate!, 'EEEE, MMMM d')}</h2>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Available Slots</p>
                </div>

                {slotsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl" />)}
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 italic text-sm">No slots available for this date.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-auto pr-2">
                    {availableSlots.map(slot => (
                      <button
                        key={slot.startTime}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setStep('form');
                        }}
                        className="w-full py-4 px-6 text-sm font-semibold border border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-slate-700"
                      >
                        {format(new Date(slot.localStartTime), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                )}
             </div>
           )}

           {step === 'form' && (
             <div className="space-y-6">
                <button onClick={() => setStep('slot')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Select another time
                </button>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">Finish Booking</h2>
                  <p className="text-xs text-slate-500">
                    {format(new Date(selectedSlot!.localStartTime), 'EEEE, MMMM d')} at {format(new Date(selectedSlot!.localStartTime), 'h:mm a')}
                  </p>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                   <Input 
                    label="Full Name" 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                   <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                   <div>
                     <Button type="submit" disabled={bookingLoading} className="w-full">
                       {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
                     </Button>
                   </div>
                </form>
             </div>
           )}
        </div>
      </div>
      
      {/* Dynamic footer decoration */}
      <div className="mt-12 text-center">
         <p className="text-xs text-slate-400 font-medium">Powered by Booker</p>
      </div>
    </div>
  );
}

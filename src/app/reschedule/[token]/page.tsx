'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarType, AvailableSlot } from '@/lib/types';
import { TIMEZONES } from '@/lib/timezone';
import '@/app/landing.css';

function ReschedulePageInner() {
  const { token } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [calendar, setCalendar] = useState<CalendarType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [bookerTimezone, setBookerTimezone] = useState('UTC');
  const [step, setStep] = useState<'date' | 'slot' | 'confirm'>('date');
  const [status, setStatus] = useState<'view' | 'success' | 'error'>('view');

  useEffect(() => {
    fetch(`/api/reschedule-info/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setBooking(data);
        setCalendar(data.calendar);
        setBookerTimezone(data.booker_timezone);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
        setLoading(false);
      });
  }, [token]);

  const fetchSlots = async (date: Date) => {
    if (!calendar) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots/${calendar.slug}?date=${format(date, 'yyyy-MM-dd')}&timezone=${bookerTimezone}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
      setStep('slot');
    } catch (e) {
      console.error(e);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    setRescheduling(true);
    try {
      const res = await fetch('/api/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }),
      });
      if (!res.ok) throw new Error('Failed to reschedule');
      setStatus('success');
    } catch (err: any) {
      alert(err.message);
      setRescheduling(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400 font-bold uppercase tracking-widest">Loading...</div>;
  if (status === 'error' || !booking) return <div className="flex items-center justify-center min-h-screen text-rose-500 font-bold uppercase tracking-widest">Invalid or expired link</div>;

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-lg p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Rescheduled!</h2>
            <p className="text-slate-500">Your meeting has been updated successfully. You will receive a new confirmation email shortly.</p>
          </div>
          <Button onClick={() => window.location.href = '/'} className="w-full">Back to Home</Button>
        </Card>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-indigo-600 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-2 block">Rescheduling Session</span>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{calendar?.name}</h1>
            <p className="text-slate-500 text-sm mt-1">Change your time from <strong>{format(new Date(booking.start_time), 'MMM d @ h:mm a')}</strong></p>
          </div>
          <div className="text-left md:text-right">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Your Timezone</label>
            <p className="text-xs font-bold text-slate-900 bg-slate-100 rounded-lg px-3 py-1.5 inline-block">{bookerTimezone}</p>
          </div>
        </div>

        {/* Main Reschedule Interface */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl ring-1 ring-slate-200/50 flex flex-col min-h-[600px] text-slate-900 transition-all overflow-hidden">
          {/* Internal Navigation */}
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
            {step === 'date' ? (
              <h2 className="text-xl font-black tracking-widest uppercase text-slate-400">Step 1: Pick Date</h2>
            ) : (
              <button onClick={() => setStep(step === 'confirm' ? 'slot' : 'date')} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 rounded-full py-2 px-4 uppercase tracking-widest transition-all">
                <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>Go Back
              </button>
            )}
            {step !== 'date' && <div className="text-xs font-black uppercase tracking-widest text-slate-300">{format(selectedDate!, 'MMMM d')}</div>}
          </div>

          {/* DATE STEP */}
          {step === 'date' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{format(currentMonth, 'MMMM yyyy')}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-4 text-center">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={i} className="aspect-square" />)}
                {days.map(day => {
                  const isPast = isBefore(day, startOfDay(new Date()));
                  const isSel = selectedDate && isSameDay(day, selectedDate);
                  return (
                    <button key={day.toString()} disabled={isPast} onClick={() => { setSelectedDate(day); fetchSlots(day); }}
                      className={`aspect-square flex flex-col items-center justify-center rounded-[1.25rem] text-base md:text-lg transition-all relative font-black ${isSel ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : isPast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-800 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                      <span>{format(day, 'd')}</span>
                      {isToday(day) && !isSel && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SLOT STEP */}
          {step === 'slot' && (
            <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-10 pt-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{format(selectedDate!, 'EEEE, MMM d')}</h2>
                <p className="text-[10px] text-indigo-600 uppercase tracking-[0.3em] font-black mt-2">Available Slots</p>
              </div>
              {slotsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {availableSlots.length > 0 ? availableSlots.map(slot => (
                    <button key={slot.startTime} onClick={() => { setSelectedSlot(slot); setStep('confirm'); }}
                      className="py-5 px-6 text-[15px] font-black border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-slate-800 uppercase tracking-tight">
                      {format(new Date(slot.localStartTime), 'h:mm a')}
                    </button>
                  )) : (
                    <div className="col-span-full py-20 text-center">
                      <p className="font-bold text-slate-300 uppercase tracking-widest text-sm">No slots available for this date.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Confirm Change?</h2>
                <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Date</span>
                    <span className="font-bold text-slate-900">{format(new Date(selectedSlot!.localStartTime), 'EEEE, MMM d')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Time</span>
                    <span className="font-bold text-slate-900">{format(new Date(selectedSlot!.localStartTime), 'h:mm a')}</span>
                  </div>
                </div>
              </div>
              <div className="w-full space-y-4">
                <Button onClick={handleReschedule} disabled={rescheduling} size="lg" className="w-full h-16 rounded-2xl text-base font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/30">
                  {rescheduling ? 'Updating...' : 'Confirm New Time'}
                </Button>
                <Button variant="ghost" className="w-full text-slate-400 font-bold uppercase tracking-widest text-xs" onClick={() => setStep('slot')}>Keep browsing times</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div>Loading reschedule link...</div>}>
      <ReschedulePageInner />
    </Suspense>
  );
}

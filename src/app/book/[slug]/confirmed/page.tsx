'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Booking, Calendar } from '@/lib/types';
import { format } from 'date-fns';

export default function ConfirmedPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const token = searchParams.get('token');
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(!!(sessionId || paymentId || token));
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      if (!id) return;
      
      // 1. Verify Payment if params exist
      if (sessionId || paymentId || token) {
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: id, sessionId, paymentId, token }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setVerifyError(verifyData.error || 'Payment verification failed');
          }
        } catch (err: any) {
          setVerifyError(err.message);
        } finally {
          setVerifying(false);
        }
      }

      // 2. Fetch Booking Info
      try {
        const res = await fetch(`/api/booking-info/${id}`);
        if (res.ok) {
          const data = await res.json();
          setBooking(data);
        }
      } catch (err) {
        console.error('Failed to fetch booking', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id, sessionId, paymentId, token]);

  if (loading || verifying) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-sm font-bold uppercase tracking-widest opacity-50 animate-pulse">{verifying ? 'Verifying Payment...' : 'Loading Booking...'}</p></div>;

  if (verifyError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </div>
          <h2 className="text-xl font-black text-rose-600">Payment Failed or Unverified</h2>
          <p className="text-sm text-slate-500 font-medium">{verifyError}</p>
          <Button className="mt-4 w-full" onClick={() => window.location.href = `/book/${booking?.calendars?.slug || ''}`}>Try Booking Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg p-8 text-center space-y-8 shadow-2xl ring-1 ring-slate-200">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter grotesque-heading uppercase">Booking Confirmed!</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mt-2">You're all set. A calendar invitation has been sent to your email.</p>
        </div>

        {booking && (
          <div className="py-6 px-6 bg-slate-50 rounded-2xl text-left space-y-4 border border-slate-100">
             <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                   <p className="font-semibold text-slate-900">{format(new Date(booking.start_time), 'EEEE, MMM d, yyyy')}</p>
                   <p className="text-sm text-slate-500">
                     {format(new Date(booking.start_time), 'h:mm a')} — {format(new Date(booking.end_time), 'h:mm a')}
                     {booking.booker_timezone && ` (${booking.booker_timezone})`}
                   </p>
                </div>
             </div>
          </div>
        )}

        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <Button 
                variant="outline" 
                className="rounded-xl font-bold uppercase tracking-widest text-[11px]"
                onClick={() => window.location.href = `/reschedule/${booking.cancellation_token}`}
              >
                Reschedule
              </Button>
              <Button 
                variant="ghost" 
                className="rounded-xl font-bold uppercase tracking-widest text-[11px] text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-100"
                onClick={() => window.location.href = `/cancel/${booking.cancellation_token}`}
              >
                Cancel
              </Button>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-3">Sync to Calendar</p>
             <Button className="w-full rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-[0.1em]">Add to Google Calendar</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

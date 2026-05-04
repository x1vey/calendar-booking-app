'use client';

import React, { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { SectionPreview } from '@/components/landing-builder';
import type { AvailableSlot } from '@/lib/types';
import '@/app/landing.css';

// ─── Map component name → dynamic import ─────────────────────────────────────
function useCalendarComponent(componentName: string) {
  switch (componentName) {
    case 'FitnessBookingCalendar':
      return dynamic(() => import('@/components/calendars/FitnessBookingCalendar'), { ssr: false });
    case 'TattooBookingCalendar':
      return dynamic(() => import('@/components/calendars/TattooBookingCalendar'), { ssr: false });
    case 'GarmentBookingCalendar':
      return dynamic(() => import('@/components/calendars/GarmentBookingCalendar'), { ssr: false });
    default:
      return dynamic(() => import('@/components/calendars/DefaultBookingCalendar'), { ssr: false });
  }
}

function ThemeSkeleton({ bg }: { bg: string }) {
  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 480, padding: '2rem' }}>
        {[80, 32, 280, 200].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: '1rem', background: 'rgba(128,128,128,0.12)', animation: 'pulse 1.8s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  );
}

  htmlOverrides,
  labels,
  pageLayout,
}: {
  calendar: any;
  theme: any;
  htmlOverrides: any;
  labels: any;
  pageLayout: any;
}) {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';
  const source = searchParams.get('source') || searchParams.get('utm_source') || '';

  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<{ id: string; name: string; email: string } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  const bookerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const [CalendarComponent] = useState(() => useCalendarComponent(theme.component));

  const handleDateSelect = async (date: Date) => {
    setSlotsLoading(true);
    setSlots([]);
    try {
      const res = await fetch(`/api/slots/${calendar.slug}?date=${format(date, 'yyyy-MM-dd')}&timezone=${encodeURIComponent(bookerTimezone)}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBook = async (slot: AvailableSlot, bookerName: string, bookerEmail: string) => {
    setBookingLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarSlug: calendar.slug,
          bookerName,
          bookerEmail,
          bookerTimezone,
          startTime: slot.startTime,
          endTime: slot.endTime,
          source,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');

      if (data.requiresPayment) {
        setPendingBooking({ id: data.booking.id, name: bookerName, email: bookerEmail });
        setPaymentModalOpen(true);
      } else {
        window.location.href = `/book/${calendar.slug}/confirmed?id=${data.booking.id}`;
      }
    } catch (err: any) {
      alert(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const processPayment = async (provider: string) => {
    if (!pendingBooking) return;
    setPaymentLoading(provider);
    try {
      const intentRes = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calendarId: calendar.id,
          provider,
          bookerName: pendingBooking.name,
          bookerEmail: pendingBooking.email,
          bookingId: pendingBooking.id,
        }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error);

      if (provider === 'stripe' || provider === 'paypal') {
        window.location.href = intentData.url;
      } else if (provider === 'razorpay') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const options = {
            key: intentData.keyId,
            amount: Math.round(intentData.amount * 100),
            currency: intentData.currency,
            name: intentData.name,
            description: 'Booking Payment',
            order_id: intentData.orderId,
            handler: function (response: any) {
              window.location.href = `/book/${calendar.slug}/confirmed?id=${pendingBooking.id}&payment_id=${response.razorpay_payment_id}`;
            },
            prefill: { name: pendingBooking.name, email: pendingBooking.email },
            theme: { color: calendar.accent_color || theme.accent },
          };
          const rzp1 = new (window as any).Razorpay(options);
          rzp1.open();
        };
        document.body.appendChild(script);
      }
    } catch (err: any) {
      alert(err.message);
      setPaymentLoading(null);
    }
  };

  const scrollToBooking = () => document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });

  const renderCalendar = () => (
    <div id="booking-section" className="w-full relative z-10">
      <Suspense fallback={<ThemeSkeleton bg={theme.previewBg} />}>
        <CalendarComponent
          studioName={calendar.name}
          tagline={calendar.subheading_text}
          location={calendar.description}
          accentColor={calendar.accent_color || theme.accent}
          slots={slots as any}
          onDateSelect={handleDateSelect}
          onBook={handleBook as any}
          slotsLoading={slotsLoading}
          bookingLoading={bookingLoading}
          headerPrefix={htmlOverrides.headerPrefix}
          headerSuffix={htmlOverrides.headerSuffix}
          footer={htmlOverrides.footer}
          labels={{ ...theme.labels, ...labels }}
          content={theme.content}
        />
      </Suspense>
    </div>
  );

  // If embed mode or landing page is disabled or no layout
  if (isEmbed || calendar.landing_page_enabled === false || !pageLayout) {
    return (
      <>
        {renderCalendar()}
        {paymentModalOpen && <PaymentModal calendar={calendar} onPay={processPayment} loading={paymentLoading} onClose={() => setPaymentModalOpen(false)} />}
      </>
    );
  }

  // Full Landing Page Mode
  return (
    <div className="landing-body w-full relative">
      <style>{`
        .lpb-preview-section .lpb-prev-h1, .lpb-preview-section .lpb-prev-h2, .lpb-preview-section .lpb-prev-h3 { color: var(--ct-heading); }
        .landing-body {
          background-color: var(--ct-bg);
          color: var(--ct-text);
          font-family: var(--ct-font);
          min-height: 100vh;
        }
      `}</style>

      {/* ── Texture Overlay ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'var(--ct-texture)',
        pointerEvents: 'none',
        opacity: 0.15,
        zIndex: 0
      }} />

      {pageLayout.sections.filter((s: any) => s.visible).map((section: any) => (
        <div key={section.id} className="lpb-preview-section">
          <SectionPreview block={section} accentColor={pageLayout.globalStyles.accentColor} theme={pageLayout.globalStyles.calendarTheme} onCtaClick={scrollToBooking} />
        </div>
      ))}

      {renderCalendar()}

      <div className="mt-20 flex justify-center items-center gap-6 text-[10px] font-black uppercase tracking-widest px-8 w-full pb-12" style={{ color: pageLayout.globalStyles.textColor, opacity: 0.5 }}>
        {calendar.privacy_url && <a href={calendar.privacy_url} className="hover:opacity-100 transition-opacity">Privacy</a>}
        {calendar.terms_url && <a href={calendar.terms_url} className="hover:opacity-100 transition-opacity">Terms</a>}
        {!calendar.hide_branding && <span>Powered by <span className="font-black opacity-100">callme</span></span>}
      </div>

      {paymentModalOpen && <PaymentModal calendar={calendar} onPay={processPayment} loading={paymentLoading} onClose={() => setPaymentModalOpen(false)} />}
    </div>
  );
}

function PaymentModal({ calendar, onPay, loading, onClose }: { calendar: any, onPay: (p: string) => void, loading: string | null, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-slate-900">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">✕</button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-slate-100 text-slate-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <h3 className="text-xl font-bold mb-1">Complete Payment</h3>
          <p className="text-sm text-slate-500 font-medium">To secure your booking, please complete the payment of {calendar.price} {calendar.currency}.</p>
        </div>
        
        <div className="space-y-3">
          {calendar.stripe_enabled && (
            <button onClick={() => onPay('stripe')} disabled={!!loading} className="w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: '#6366f1', color: '#fff' }}>
              {loading === 'stripe' ? 'Processing...' : 'Pay with Stripe (Card)'}
            </button>
          )}
          {calendar.paypal_enabled && (
            <button onClick={() => onPay('paypal')} disabled={!!loading} className="w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: '#0070ba', color: '#fff' }}>
              {loading === 'paypal' ? 'Processing...' : 'Pay with PayPal'}
            </button>
          )}
          {calendar.razorpay_enabled && (
            <button onClick={() => onPay('razorpay')} disabled={!!loading} className="w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50" style={{ backgroundColor: '#3399cc', color: '#fff' }}>
              {loading === 'razorpay' ? 'Processing...' : 'Pay with Razorpay'}
            </button>
          )}
          {!calendar.stripe_enabled && !calendar.paypal_enabled && !calendar.razorpay_enabled && (
            <p className="text-xs text-rose-500 font-bold text-center">No payment gateways configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}

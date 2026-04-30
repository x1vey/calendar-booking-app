'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { Calendar as CalendarType, AvailableSlot } from '@/lib/types';
import { TIMEZONES } from '@/lib/timezone';
import '@/app/landing.css';

interface ExtendedCalendar extends CalendarType {
  avatar_url?: string | null;
  about_me?: string | null;
  display_name?: string | null;
}

const getYTId = (url: any): string | null => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^?&"'>\s]+)/);
  if (!match || !match[1]) return null;
  return match[1].split(/[?&]/)[0].slice(0, 11);
};

function BookingPageInner({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || searchParams.get('utm_source') || '';

  const [calendar, setCalendar] = useState<ExtendedCalendar | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookerTimezone, setBookerTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [step, setStep] = useState<'date' | 'slot' | 'form'>('date');
  const [reviewsData, setReviewsData] = useState<any | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetch(`/api/calendar-meta/${slug}`)
      .then(res => { if (!res.ok) throw new Error('Not found'); return res.json(); })
      .then(data => setCalendar(data))
      .catch(() => setCalendar(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (calendar?.google_place_id) {
      setReviewsLoading(true);
      fetch(`/api/reviews/${calendar.google_place_id}`)
        .then(res => res.json())
        .then(data => { if (!data.error) setReviewsData(data); })
        .catch(console.error)
        .finally(() => setReviewsLoading(false));
    }
  }, [calendar?.google_place_id]);

  const fetchSlots = async (date: Date) => {
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots/${slug}?date=${format(date, 'yyyy-MM-dd')}&timezone=${bookerTimezone}`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
      setStep('slot');
    } catch (e) { console.error(e); }
    finally { setSlotsLoading(false); }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calendarSlug: slug, bookerName: formData.name, bookerEmail: formData.email, bookerTimezone, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, source }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = `/book/${slug}/confirmed?id=${data.booking.id}`;
    } catch (err: any) { alert(err.message); setBookingLoading(false); }
  };

  const scrollToBooking = () => document.getElementById('booking-grid')?.scrollIntoView({ behavior: 'smooth' });

  if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400 font-bold uppercase tracking-widest">Loading...</div>;
  if (!calendar) return <div className="flex items-center justify-center min-h-screen text-slate-400 font-bold uppercase tracking-widest">Calendar not found</div>;

  const monthStart = startOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) });
  const mainYoutubeId = getYTId(calendar.youtube_video_url);
  const rawTestimonials = calendar.testimonial_videos;
  const testimonialList: string[] = Array.isArray(rawTestimonials) ? rawTestimonials : (typeof rawTestimonials === 'string' ? [rawTestimonials] : []);

  // ─── MINIMAL MODE ────────────────────────────────────────────────────────────
  if (calendar.landing_page_enabled === false) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden ring-1 ring-slate-200">
          <div className="w-full md:w-1/3 p-8 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6">{calendar.name[0]}</div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{calendar.name}</h1>
            <p className="text-sm text-slate-600">{calendar.description}</p>
          </div>
          <div className="w-full md:w-2/3 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
              <div className="flex gap-2">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-slate-100 rounded-xl"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-xs text-slate-400 font-bold">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={i} />)}
              {days.map(day => {
                const past = isBefore(day, startOfDay(new Date()));
                const sel = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button key={day.toString()} disabled={past} onClick={() => { setSelectedDate(day); fetchSlots(day); }}
                    className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${sel ? 'bg-blue-600 text-white' : past ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-blue-50 text-slate-700'}`}>
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CSS VARIABLES ────────────────────────────────────────────────────────────
  const themeVars = {
    '--theme-bg': calendar.theme_bg_color || '#f8fafc',
    '--theme-text': calendar.theme_text_color || '#0f172a',
    '--theme-heading': calendar.theme_heading_color || '#0f172a',
    '--theme-subheading': calendar.theme_subheading_color || '#64748b',
  } as React.CSSProperties;

  // ─── FULL LANDING PAGE ────────────────────────────────────────────────────────
  return (
    <div style={{ ...themeVars, backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }} className="min-h-screen flex flex-col items-center pb-20 landing-body selection:bg-blue-600 selection:text-white">

      {/* ── HERO ── */}
      <div className="w-full max-w-7xl px-4 flex flex-col lg:flex-row items-center justify-between gap-12 mt-16 md:mt-24 lg:mt-32 mb-20 md:mb-32">
        <div className={`flex flex-col flex-1 ${!calendar.hero_image_url ? 'items-center text-center max-w-4xl mx-auto' : ''}`}>
          <h1 style={{ color: 'var(--theme-heading)' }} className="text-5xl md:text-7xl lg:text-8xl font-black grotesque-heading tracking-tighter uppercase leading-[0.9]">
            {calendar.heading_text || calendar.name}
          </h1>
          {calendar.subheading_text && (
            <p style={{ color: 'var(--theme-subheading)' }} className="text-xl md:text-2xl font-bold mt-6 max-w-2xl">{calendar.subheading_text}</p>
          )}
          <div className={`mt-10 flex ${!calendar.hero_image_url ? 'justify-center' : ''}`}>
            <button onClick={scrollToBooking} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center px-10 py-5 rounded-[2rem] text-lg font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30">
              {calendar.cta_button_text || 'Book Now'}
              <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>
        {calendar.hero_image_url && (
          <div className="flex-1 w-full relative">
            <img src={calendar.hero_image_url} alt="Hero" className="w-full object-cover rounded-[3rem] shadow-2xl" style={{ aspectRatio: '4/5' }} />
          </div>
        )}
      </div>

      <div className="w-full max-w-5xl px-4 flex flex-col space-y-24">

        {/* ── VSL VIDEO ── */}
        {mainYoutubeId && (
          <div className="w-full max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-white bg-black" style={{ aspectRatio: '16/9' }}>
            <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${mainYoutubeId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
        )}

        {/* ── EXPECTATIONS ── */}
        {calendar.expectations_headline && (
          <div className="bg-black/5 rounded-[3rem] p-8 md:p-12 border border-black/5 text-center max-w-4xl mx-auto w-full">
            <h2 style={{ color: 'var(--theme-heading)' }} className="text-3xl font-black tracking-tight">{calendar.expectations_headline}</h2>
            {calendar.expectations_body && (
              <p style={{ color: 'var(--theme-subheading)' }} className="text-base font-medium leading-relaxed mt-6 whitespace-pre-wrap max-w-3xl mx-auto">{calendar.expectations_body}</p>
            )}
          </div>
        )}

        {/* ── BOOKING CALENDAR ── */}
        <div id="booking-grid" className="scroll-mt-32 max-w-4xl mx-auto w-full">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl ring-1 ring-slate-200/50 flex flex-col min-h-[600px] text-slate-900">

            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
              {step === 'date' ? (
                <h2 className="text-2xl font-black tracking-tighter grotesque-heading uppercase text-slate-900">Select Date</h2>
              ) : (
                <button onClick={() => setStep(step === 'slot' ? 'date' : 'slot')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 rounded-full py-2 px-4 uppercase tracking-widest transition-all">
                  <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>Back
                </button>
              )}
              <div className="text-right">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Timezone</label>
                <select className="text-xs font-bold text-slate-900 bg-slate-50 border-none rounded-xl px-3 py-1.5 outline-none cursor-pointer" value={bookerTimezone} onChange={e => setBookerTimezone(e.target.value)}>
                  {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            </div>

            {/* DATE STEP */}
            {step === 'date' && (
              <div className="space-y-8 flex-1 max-w-2xl mx-auto w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">{format(currentMonth, 'MMMM yyyy')}</h3>
                  <div className="flex space-x-2">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg></button>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-4 text-center">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: monthStart.getDay() }).map((_, i) => <div key={i} className="aspect-square" />)}
                  {days.map(day => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isSel = selectedDate && isSameDay(day, selectedDate);
                    return (
                      <button key={day.toString()} disabled={isPast} onClick={() => { setSelectedDate(day); fetchSlots(day); }}
                        className={`aspect-square flex flex-col items-center justify-center rounded-[1.25rem] text-lg transition-all relative font-bold ${isSel ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : isPast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 hover:scale-105 active:scale-95'}`}>
                        <span>{format(day, 'd')}</span>
                        {isToday(day) && !isSel && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SLOT STEP */}
            {step === 'slot' && (
              <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
                <div className="text-center mb-10 pt-4">
                  <h2 className="text-3xl font-black text-slate-900">{format(selectedDate!, 'EEEE, MMMM d')}</h2>
                  <p className="text-xs text-blue-600 uppercase tracking-widest font-bold mt-2">Pick an available slot</p>
                </div>
                {slotsLoading ? (
                  <div className="grid grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i => <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl" />)}</div>
                ) : availableSlots.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-bold text-slate-400 uppercase tracking-widest text-sm">No slots available for this date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSlots.map(slot => (
                      <button key={slot.startTime} onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                        className="py-5 px-6 text-[15px] font-bold border-2 border-slate-100 rounded-2xl hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all text-slate-700 active:scale-95">
                        {format(new Date(slot.localStartTime), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FORM STEP */}
            {step === 'form' && (
              <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Final Step</h2>
                  <p className="text-sm font-bold text-slate-500 mt-2">
                    {format(new Date(selectedSlot!.localStartTime), 'MMM d, yyyy')} • {format(new Date(selectedSlot!.localStartTime), 'h:mm a')}
                  </p>
                </div>
                <form onSubmit={handleBooking} className="space-y-5">
                  <Input label="First & Last Name" placeholder="Your full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                  <Input label="Email Address" type="email" placeholder="you@company.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                  <div className="pt-2">
                    <Button type="submit" disabled={bookingLoading} className="w-full btn-pill h-14 text-sm uppercase tracking-widest font-black shadow-xl shadow-blue-600/30 text-white">
                      {bookingLoading ? 'Securing Slot...' : 'Confirm Call'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* ── GOOGLE REVIEWS ── */}
        {calendar.google_place_id && (
          <div className="w-full max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl ring-1 ring-slate-200/50 text-slate-900">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="font-black text-2xl md:text-3xl tracking-tight">{reviewsData?.placeName || 'Google Reviews'}</h3>
                {reviewsData && (
                  <div className="flex items-center mt-2 gap-2">
                    <span className="text-amber-400 tracking-widest">{'★'.repeat(Math.round(reviewsData.rating))}</span>
                    <span className="text-sm font-bold text-slate-500">{reviewsData.rating.toFixed(1)} ({reviewsData.totalRatings} reviews)</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewsLoading && [1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />)}
              {reviewsData?.reviews?.slice(0, 4).map((rev: any, idx: number) => (
                <div key={idx} className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                  <div className="flex items-center mb-3">
                    {rev.authorPhoto
                      ? <img src={rev.authorPhoto} alt={rev.authorName} className="w-10 h-10 rounded-full" />
                      : <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">{rev.authorName[0]}</div>}
                    <div className="ml-3">
                      <p className="text-sm font-bold text-slate-900">{rev.authorName}</p>
                      <span className="text-amber-400 text-xs">{'★'.repeat(Math.round(rev.rating))}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-4 leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TESTIMONIAL VIDEO ── */}
        {testimonialList.length > 0 && (
          <div className="w-full max-w-4xl mx-auto text-center" style={{ paddingBottom: '2rem' }}>
            <h3 style={{ color: 'var(--theme-heading)' }} className="text-sm font-black uppercase tracking-[0.2em] mb-10 block">
              {calendar.testimonial_headline || 'Client Testimonial'}
            </h3>
            <div className="flex flex-col items-center gap-12">
              {testimonialList.map((url, i) => {
                const tId = getYTId(url);
                if (!tId) return null;
                const isShort = url.toLowerCase().includes('shorts');
                return (
                  <div key={i} style={{
                    width: '100%',
                    maxWidth: isShort ? '340px' : '800px',
                    aspectRatio: isShort ? '9/16' : '16/9',
                    borderRadius: '2rem',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                    outline: '8px solid white',
                    background: '#000',
                    margin: '0 auto',
                  }}>
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${tId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-20 flex justify-center items-center gap-6 text-[10px] font-black uppercase tracking-widest px-8 w-full" style={{ color: 'var(--theme-subheading)' }}>
        <div className="h-px flex-1 hidden md:block opacity-20" style={{ background: 'var(--theme-subheading)' }} />
        {calendar.privacy_url && <a href={calendar.privacy_url} className="opacity-60 hover:opacity-100 transition-opacity">Privacy</a>}
        {calendar.terms_url && <a href={calendar.terms_url} className="opacity-60 hover:opacity-100 transition-opacity">Terms</a>}
        {!calendar.hide_branding && <span>Powered by <span className="font-black opacity-100" style={{ color: 'var(--theme-heading)' }}>callme</span></span>}
        <div className="h-px flex-1 hidden md:block opacity-20" style={{ background: 'var(--theme-subheading)' }} />
      </div>
    </div>
  );
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading...</div>}>
      <BookingPageInner slug={slug} />
    </Suspense>
  );
}

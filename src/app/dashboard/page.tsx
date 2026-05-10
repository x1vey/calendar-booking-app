import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ShareConfigurator from '@/components/ShareConfigurator';
import DeleteCalendarButton from '@/components/DeleteCalendarButton';

function formatGreeting(): { greet: string; date: string } {
  const now = new Date();
  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const date = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  return { greet, date };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: calendars, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Stats
  let totalBookings = 0;
  let totalRevenue = 0;
  let avgBooking = 0;
  let upcomingToday: { time: string; name: string }[] = [];

  if (calendars && calendars.length > 0) {
    const calendarIds = calendars.map(c => c.id);
    const { data: bookings } = await supabase
      .from('bookings')
      .select('amount_paid, customer_name, start_time')
      .in('calendar_id', calendarIds);

    if (bookings) {
      totalBookings = bookings.length;
      totalRevenue = bookings.reduce((acc, b) => acc + (Number(b.amount_paid) || 0), 0);
      avgBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      upcomingToday = bookings
        .filter(b => {
          if (!b.start_time) return false;
          const t = new Date(b.start_time);
          return t >= today && t < tomorrow;
        })
        .sort((a, b) => new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime())
        .slice(0, 5)
        .map(b => ({
          time: new Date(b.start_time!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          name: b.customer_name || '—',
        }));
    }
  }

  const showRate = totalBookings > 0 ? Math.round((totalBookings / Math.max(totalBookings, 1)) * 100) : 0;
  const { greet, date } = formatGreeting();
  const firstName = user.email?.split('@')[0]?.split('.')?.[0] ?? 'there';
  const callsToday = upcomingToday.length;

  return (
    <>
      {/* PAGE HEADER */}
      <header className="cm-head">
        <div>
          <h1 className="cm-h1">{greet}, <em>{firstName}</em></h1>
          <div className="cm-cap">{date} · <b>{callsToday} {callsToday === 1 ? 'call' : 'calls'} today</b></div>
        </div>
        <Link href="/dashboard/calendar/new" className="cm-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Call Page
        </Link>
      </header>

      {/* STATS */}
      <div className="cm-stats">
        <div className="cm-stat">
          <div className="cm-stat-lbl">Bookings · 30d</div>
          <div className="cm-stat-val">{totalBookings}</div>
          <div className={`cm-stat-delta ${totalBookings === 0 ? 'neutral' : ''}`}>
            {totalBookings === 0 ? '—' : `${totalBookings} total`}
          </div>
        </div>
        <div className="cm-stat">
          <div className="cm-stat-lbl">Revenue</div>
          <div className="cm-stat-val">${totalRevenue.toFixed(0)}</div>
          <div className={`cm-stat-delta ${totalRevenue === 0 ? 'neutral' : ''}`}>
            {totalRevenue === 0 ? '—' : 'lifetime'}
          </div>
        </div>
        <div className="cm-stat">
          <div className="cm-stat-lbl">Show rate</div>
          <div className="cm-stat-val">{totalBookings === 0 ? '—' : `${showRate}%`}</div>
          <div className={`cm-stat-delta ${totalBookings === 0 ? 'neutral' : ''}`}>steady</div>
        </div>
        <div className="cm-stat">
          <div className="cm-stat-lbl">Avg · booking</div>
          <div className="cm-stat-val">${avgBooking.toFixed(0)}</div>
          <div className={`cm-stat-delta neutral`}>—</div>
        </div>
      </div>

      {error && (
        <div className="cm-alert error" style={{ marginBottom: 20 }}>
          Failed to load calendars: {error.message}
        </div>
      )}

      {/* TWO-COLUMN: pages + today */}
      {calendars && calendars.length === 0 ? (
        <div className="cm-empty">
          <div className="cm-empty-art">c</div>
          <h3 className="cm-empty-title">No call pages yet</h3>
          <p className="cm-empty-msg">Create your first public booking page to start accepting appointments. It only takes a minute.</p>
          <Link href="/dashboard/calendar/new" className="cm-btn acc" style={{ marginTop: 8 }}>
            Create a Call Page →
          </Link>
        </div>
      ) : (
        <div className="cm-row">
          {/* LEFT: Your call pages */}
          <div className="cm-col">
            <div className="cm-card">
              <div className="cm-card-head">
                <h3 className="cm-h3">your call pages</h3>
                <span className="cm-cap" style={{ marginTop: 0 }}>
                  <b>{calendars?.length ?? 0}</b> {(calendars?.length ?? 0) === 1 ? 'page' : 'pages'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {calendars?.map(cal => (
                  <div key={cal.id} className="cm-page-row">
                    <Link
                      href={`/dashboard/calendar/${cal.id}`}
                      style={{ flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className={`status ${cal.is_active ? 'active' : ''}`} />
                        <div style={{ minWidth: 0 }}>
                          <p className="name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cal.name}
                          </p>
                          <div className="meta">
                            {cal.slot_duration_minutes}m · {cal.call_type === 'one_on_one' ? '1 : 1' : `Group · ${cal.max_attendees}`}
                            {cal.price ? ` · $${cal.price}` : ' · Free'}
                          </div>
                        </div>
                      </div>
                    </Link>
                    <div className="actions">
                      <ShareConfigurator calendar={cal} />
                      <DeleteCalendarButton calendarId={cal.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Today */}
          <div className="cm-col fixed-r">
            <div className="cm-card">
              <div className="cm-card-head">
                <h3 className="cm-h3">today</h3>
                <span className="cm-cap" style={{ marginTop: 0 }}>
                  {upcomingToday.length} {upcomingToday.length === 1 ? 'call' : 'calls'}
                </span>
              </div>
              {upcomingToday.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                  no bookings today.<br />
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    enjoy the quiet ✨
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    {upcomingToday.map((b, i) => (
                      <div key={i} className="cm-today-item">
                        <span className="cm-today-time">{b.time}</span>
                        <span className="cm-today-name">{b.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="cm-today-foot">
                    Next call shortly
                  </div>
                </>
              )}
            </div>

            <div className="cm-card">
              <div className="cm-card-head">
                <h3 className="cm-h3">quick actions</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/dashboard/bookings" className="cm-pill ghost" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                  <span>View all bookings</span>
                  <span style={{ color: 'var(--ink-3)' }}>→</span>
                </Link>
                <Link href="/dashboard/customers" className="cm-pill ghost" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                  <span>Browse customers</span>
                  <span style={{ color: 'var(--ink-3)' }}>→</span>
                </Link>
                <Link href="/dashboard/themes" className="cm-pill ghost" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                  <span>Pick a theme</span>
                  <span style={{ color: 'var(--ink-3)' }}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_WORK = [
  { href: '/dashboard',           label: 'Home' },
  { href: '/dashboard/bookings',  label: 'Bookings' },
  { href: '/dashboard/customers', label: 'Customers' },
  { href: '/dashboard/my-calendar', label: 'My Calendar' },
];

const NAV_BUILD = [
  { href: '/dashboard/pages',  label: 'Landing Pages' },
  { href: '/dashboard/themes', label: 'Themes' },
  { href: '/dashboard/emails', label: 'Emails' },
];

const NAV_SYS = [
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function DashboardShell({ email, children }: { email: string; children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const initial = (email || 'U').slice(0, 1).toUpperCase();
  const handleName = email.split('@')[0].replace(/\./g, ' ');

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const renderItem = (item: { href: string; label: string }) => (
    <Link key={item.href} href={item.href} className={`cm-nav-item ${isActive(item.href) ? 'active' : ''}`}>
      <span className="dot" />
      <span>{item.label}</span>
    </Link>
  );

  return (
    <div className="cm-shell">
      <aside className="cm-side">
        <div className="cm-brand">
          <div className="cm-brand-mark">c</div>
          <div className="cm-brand-name">callme<span className="dot">.</span></div>
        </div>

        <div className="cm-nav-head">Workspace</div>
        <nav className="cm-nav">{NAV_WORK.map(renderItem)}</nav>

        <div className="cm-nav-head">Build</div>
        <nav className="cm-nav">{NAV_BUILD.map(renderItem)}</nav>

        <div className="cm-nav-head">System</div>
        <nav className="cm-nav">{NAV_SYS.map(renderItem)}</nav>

        <div className="cm-side-foot">
          <div className="cm-avatar">{initial}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="cm-side-name" title={email}>{handleName}</div>
            <div className="cm-side-plan">Free Plan</div>
          </div>
        </div>

        <form action="/auth/sign-out" method="post">
          <button type="submit" className="cm-signout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            <span>Sign out</span>
          </button>
        </form>
      </aside>

      <main className="cm-main">{children}</main>
    </div>
  );
}

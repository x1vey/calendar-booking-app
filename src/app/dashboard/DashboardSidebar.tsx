'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_PRIMARY = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    exact: true,
  },
  {
    href: '/dashboard/bookings',
    label: 'Bookings',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    href: '/dashboard/customers',
    label: 'Customers',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  },
  {
    href: '/dashboard/my-calendar',
    label: 'My Calendar',
    icon: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  },
];

const NAV_BUILD = [
  {
    href: '/dashboard/pages',
    label: 'Landing Pages',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    href: '/dashboard/themes',
    label: 'Themes',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
  },
  {
    href: '/dashboard/emails',
    label: 'Emails',
    icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
];

const NAV_SYSTEM = [
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
];

function NavItem({ href, label, icon, exact, currentPath }: { href: string; label: string; icon: string; exact?: boolean; currentPath: string }) {
  const isActive = exact ? currentPath === href : currentPath === href || currentPath.startsWith(href + '/');
  return (
    <Link href={href} className={`ds-nav-item ${isActive ? 'active' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {icon.split(' M').map((d, i) => <path key={i} d={i === 0 ? d : 'M' + d} />)}
      </svg>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardSidebar({ email }: { email: string }) {
  const pathname = usePathname() ?? '';
  const [mobileOpen, setMobileOpen] = useState(false);
  const initial = (email || 'U').slice(0, 1).toUpperCase();

  return (
    <>
      <button className="ds-menu-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          {mobileOpen
            ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
            : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
          }
        </svg>
      </button>

      <aside className={`ds-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="ds-brand">
          <div className="ds-brand-mark">c</div>
          <div className="ds-brand-name">callme<span className="accent">.</span></div>
        </div>

        <div className="ds-nav-heading">Workspace</div>
        <div className="ds-nav">
          {NAV_PRIMARY.map(item => <NavItem key={item.href} {...item} currentPath={pathname} />)}
        </div>

        <div className="ds-nav-heading">Build</div>
        <div className="ds-nav">
          {NAV_BUILD.map(item => <NavItem key={item.href} {...item} currentPath={pathname} />)}
        </div>

        <div className="ds-nav-heading">System</div>
        <div className="ds-nav">
          {NAV_SYSTEM.map(item => <NavItem key={item.href} {...item} currentPath={pathname} />)}
        </div>

        <div className="ds-sidebar-footer">
          <div className="ds-user-card" title={email}>
            <div className="ds-user-avatar">{initial}</div>
            <div className="ds-user-email">{email}</div>
          </div>
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="ds-signout-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

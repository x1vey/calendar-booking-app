import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTheme, buildThemeCSS, type CalendarTheme } from '@/lib/themes';
import ClientBookingPage from './ClientBookingPage';

interface Params {
  slug: string;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: cal } = await supabase
    .from('calendars')
    .select('name, description, calendar_theme')
    .eq('slug', slug)
    .single();

  if (!cal) {
    return { title: 'Book — callme' };
  }

  const theme = getTheme(cal.calendar_theme as CalendarTheme);
  const description = cal.description ?? theme.description;

  return {
    title: `Book with ${cal.name} — callme`,
    description,
    openGraph: {
      title: `Book with ${cal.name}`,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `Book with ${cal.name}`,
      description,
    },
  };
}

export default async function BookingPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Fetch full calendar row
  const { data: calendar, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !calendar) {
    notFound();
  }

  const themeKey = (calendar.calendar_theme || 'default') as CalendarTheme;
  const theme    = getTheme(themeKey);

   let htmlOverrides: any = {};
  let styleOverrides: any = {};
  let labels: any = {};
  if (calendar.calendar_layout) {
    try {
      const parsed = JSON.parse(calendar.calendar_layout);
      htmlOverrides = parsed.htmlOverrides ?? {};
      styleOverrides = parsed.styles ?? {};
      labels = parsed.labels ?? {};
    } catch {}
  }



  let pageLayout: any = null;
  if (calendar.landing_layout) {
    try {
      pageLayout = typeof calendar.landing_layout === 'string' ? JSON.parse(calendar.landing_layout) : calendar.landing_layout;
    } catch {}
  }

  const themeCSS = buildThemeCSS(themeKey, {
    accentColor: calendar.accent_color ?? pageLayout?.globalStyles?.accentColor ?? styleOverrides.accentColor ?? null,
    bgColor:     pageLayout?.globalStyles?.bgColor ?? styleOverrides.bgColor ?? null,
    textColor:   pageLayout?.globalStyles?.textColor ?? styleOverrides.textColor ?? null,
    ...styleOverrides,
    ...(pageLayout?.globalStyles ?? {})
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCSS }} />
       <ClientBookingPage
        calendar={calendar}
        theme={theme}
        htmlOverrides={htmlOverrides}
        labels={labels}
        pageLayout={pageLayout}
      />
    </>
  );
}

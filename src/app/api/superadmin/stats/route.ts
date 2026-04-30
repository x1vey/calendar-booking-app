import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();

  // Get total users count from auth.users (requires service role)
  // Note: Depending on Supabase setup, counting auth.users might need a specific RPC or checking user_settings
  const { count: usersCount } = await supabase
    .from('user_settings')
    .select('*', { count: 'exact', head: true });

  const { count: calendarsCount } = await supabase
    .from('calendars')
    .select('*', { count: 'exact', head: true });

  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('user_settings')
    .select('display_name, avatar_url, updated_at, user_id')
    .order('updated_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    stats: {
      totalUsers: usersCount || 0,
      totalCalendars: calendarsCount || 0,
      totalBookings: bookingsCount || 0,
    },
    recentUsers: recentUsers || []
  });
}

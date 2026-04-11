const { createClient } = require('@supabase/supabase-js');
// Use environment variables for secrets
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
(async () => {
    const { data: userSettings } = await supabase.from('user_settings').select('*');
    console.log('user_settings:', JSON.stringify(userSettings, null, 2));

    const { data: cals } = await supabase.from('calendars').select('id, name, user_id, google_refresh_token');
    console.log('calendars:', JSON.stringify(cals, null, 2));
    
    // Check if bookings map fails?
    const { data: bookings } = await supabase.from('bookings').select('*');
    console.log('bookings:', typeof bookings, Array.isArray(bookings));
})();

const { createClient } = require('@supabase/supabase-js');

// Use environment variables for secrets
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    // try to fetch the endpoint locally
    try {
        const fetch = require('node-fetch'); // Not installed? Node global fetch is in v18+
        const res = await globalThis.fetch('http://localhost:3000/api/admin/bookings/c12891f8-e957-47ef-9b27-20365ddd173c', {
            // we'd need auth headers to actually test it if it strictly checks user
            // so let's just make the SQL query
        });
        console.log('HTTP status:', res.status);
        const text = await res.text();
        console.log('HTTP response:', text);
    } catch(e) {
        console.error(e);
    }
})();

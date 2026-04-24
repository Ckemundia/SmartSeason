require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    try {
        console.log("Checking Users table connection...");
        const { data, error } = await db.from('users').select('*').limit(1);
        if (error) {
            console.error("SUPABASE API ERROR:", error);
        } else {
            console.log("SUCCESS:", data);
        }
    } catch (e) {
        console.error("NATIVE ERROR:", e);
    }
})();

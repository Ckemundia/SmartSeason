require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    try {
        console.log("Hashing 'admin123'...");
        const newHash = await bcrypt.hash('admin123', 10);
        
        console.log("Updating Supabase Admin account password...");
        const { data, error } = await db.from('users').update({ password: newHash }).eq('email', 'admin@smartseason.com').select();
        
        if (error) {
            console.error("Supabase Error:", error);
        } else {
            console.log("Successfully fixed the Admin password in Supabase! You can now log in.");
        }
    } catch (e) {
        console.error("Local Error:", e);
    }
})();

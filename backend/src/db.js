const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("WARNING: Supabase URL or Service Role Key missing from backend/.env ! Authentication will fail.");
}

// In a robust implementation, the Service Role Key bypasses Supabase's RLS ensuring our Node.js 
// APIs handle authentication cleanly.
const db = createClient(supabaseUrl, supabaseKey);

module.exports = db;

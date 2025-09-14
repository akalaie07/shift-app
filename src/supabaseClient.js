// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cchexfzhedahumiytsnn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjaGV4ZnpoZWRhaHVtaXl0c25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDcyMDEsImV4cCI6MjA3MzE4MzIwMX0.iSf0hX9P4d3W0KveRpYmBE_4A9RRg8_QhvBV2aSuoIg";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

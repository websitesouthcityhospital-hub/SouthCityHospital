import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTests() {
  console.log("Running RPC Tests...");
  
  // Need to get a doctor ID
  const { data: doctors } = await supabase.from('doctors').select('id').limit(1);
  if (!doctors || doctors.length === 0) {
    console.log("No doctors found for testing.");
    return;
  }
  const doctorId = doctors[0].id;
  console.log("Testing with Doctor ID:", doctorId);

  // Test 1: Normal date (Tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate1 = tomorrow.toISOString().split('T')[0];
  
  console.log(`\nTest 1: Target Date ${targetDate1}`);
  let res = await supabase.rpc('get_doctor_availability_range', {
    p_doctor_id: doctorId,
    p_target_date: targetDate1
  });
  console.log(res.data || res.error);

  // Test 2: Past date
  const past = new Date();
  past.setDate(past.getDate() - 1);
  const targetDate2 = past.toISOString().split('T')[0];
  
  console.log(`\nTest 2: Past Date ${targetDate2}`);
  res = await supabase.rpc('get_doctor_availability_range', {
    p_doctor_id: doctorId,
    p_target_date: targetDate2
  });
  console.log(res.data || res.error);
}

runTests();

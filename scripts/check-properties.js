import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kepvtlgmtwhjsryfqexg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHZ0bGdtdHdoanNyeWZxZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzMxNjIsImV4cCI6MjA2NTUwOTE2Mn0.ET4r3HCZOP-9uddMergtO1n6baHqxd3r2Fq6F5wQF7w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperties() {
  console.log('Checking existing properties...');
  
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error('Error fetching properties:', error);
      return;
    }
    
    console.log(`Found ${data?.length || 0} properties:`);
    
    if (data && data.length > 0) {
      data.forEach((property, index) => {
        console.log(`${index + 1}. ${property.title} (ID: ${property.id})`);
        console.log(`   Price: ₦${property.price?.toLocaleString()}`);
        console.log(`   Location: ${property.city}, ${property.state}`);
        console.log(`   Type: ${property.property_type}`);
        console.log('');
      });
    } else {
      console.log('No properties found in database.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkProperties();
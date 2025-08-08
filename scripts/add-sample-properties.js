import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ioxdzgnhggyenwlyjphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveGR6Z25oZ2d5ZW53bHlqcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTM4MzUsImV4cCI6MjA2NjQ4OTgzNX0.UzRCb6rc75O6FTX0wQ_GdTfUWjf4AARKDc5VDB730cM';

const supabase = createClient(supabaseUrl, supabaseKey);

const simpleProperties = [
  {
    title: "Modern 3-Bedroom Apartment in Victoria Island",
    description: "Stunning modern apartment with panoramic views of Lagos lagoon.",
    price: 45000000,
    property_type: "apartment",
    listing_type: "sale",
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 150,
    address: "123 Luxury Lane",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Luxury 4-Bedroom Duplex in Lekki",
    description: "Beautifully designed duplex in a serene estate.",
    price: 75000000,
    property_type: "duplex",
    listing_type: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 250,
    address: "456 Estate Drive",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Executive 2-Bedroom Flat in Ikeja GRA",
    description: "Well-maintained apartment in premier location.",
    price: 25000000,
    property_type: "apartment",
    listing_type: "sale",
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 120,
    address: "789 GRA Street",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    images: ["/placeholder.svg"]
  },
  {
    title: "Elegant 4-Bedroom House in Abuja",
    description: "Modern house in upscale neighborhood.",
    price: 55000000,
    property_type: "house",
    listing_type: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 180,
    address: "303 Maitama District",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    images: ["/placeholder.svg", "/placeholder.svg"]
  }
];

async function addSampleProperties() {
  console.log('Adding sample properties...');
  
  try {
    // Insert properties one by one to avoid RLS issues
    for (const property of simpleProperties) {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select();
      
      if (error) {
        console.error(`Error inserting property "${property.title}":`, error.message);
      } else {
        console.log(`✓ Added: ${property.title}`);
      }
      
      // Small delay between insertions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Finished adding sample properties!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
addSampleProperties();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ioxdzgnhggyenwlyjphb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlveGR6Z25oZ2d5ZW53bHlqcGhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTM4MzUsImV4cCI6MjA2NjQ4OTgzNX0.UzRCb6rc75O6FTX0wQ_GdTfUWjf4AARKDc5VDB730cM';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProperties = [
  // Lagos Properties
  {
    title: "Modern 3-Bedroom Apartment in Victoria Island",
    description: "Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes and smart home technology.",
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
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    agent_id: "550e8400-e29b-41d4-a716-446655440001" // Valid agent ID from SQL setup
  },
  {
    title: "Luxury 4-Bedroom Duplex in Lekki",
    description: "Beautifully designed duplex in a serene estate with 24/7 security and modern amenities.",
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
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Executive 2-Bedroom Flat in Ikeja GRA",
    description: "Well-maintained apartment in premier location with excellent transport links.",
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
    featured: false,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Ultra-Luxury 5-Bedroom Mansion in Banana Island",
    description: "Ultra-luxury mansion with private beach access and world-class amenities.",
    price: 250000000,
    property_type: "house",
    listing_type: "sale",
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 400,
    address: "101 Banana Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Contemporary 3-Bedroom Penthouse in Ikoyi",
    description: "Exclusive penthouse with 360-degree views and premium finishes.",
    price: 85000000,
    property_type: "apartment",
    listing_type: "sale",
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 200,
    address: "202 Ikoyi Heights",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  
  // Abuja Properties
  {
    title: "Elegant 4-Bedroom Terrace in Maitama",
    description: "Modern terrace house in upscale neighborhood with excellent amenities.",
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
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Spacious 5-Bedroom Detached House in Asokoro",
    description: "Beautiful detached house with large compound and modern facilities.",
    price: 95000000,
    property_type: "house",
    listing_type: "sale",
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 300,
    address: "404 Asokoro Avenue",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Modern 3-Bedroom Apartment in Wuse 2",
    description: "Contemporary apartment in the heart of Abuja's business district.",
    price: 35000000,
    property_type: "apartment",
    listing_type: "sale",
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 140,
    address: "505 Wuse 2 Plaza",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    featured: false,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  
  // Port Harcourt Properties
  {
    title: "Waterfront 4-Bedroom Villa in GRA",
    description: "Stunning waterfront villa with private jetty and panoramic river views.",
    price: 65000000,
    property_type: "house",
    listing_type: "sale",
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 220,
    address: "606 GRA Waterfront",
    city: "Port Harcourt",
    state: "Rivers State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Executive 3-Bedroom Duplex in Old GRA",
    description: "Well-appointed duplex in prestigious Old GRA with mature gardens.",
    price: 42000000,
    property_type: "duplex",
    listing_type: "sale",
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 170,
    address: "707 Old GRA",
    city: "Port Harcourt",
    state: "Rivers State",
    country: "Nigeria",
    featured: false,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  
  // Rental Properties
  {
    title: "Furnished 2-Bedroom Apartment for Rent in VI",
    description: "Fully furnished modern apartment available for short or long-term rental.",
    price: 2500000, // Annual rent
    property_type: "apartment",
    listing_type: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 100,
    address: "808 Victoria Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: false,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Luxury 3-Bedroom Serviced Apartment in Lekki",
    description: "Premium serviced apartment with housekeeping and concierge services.",
    price: 4200000, // Annual rent
    property_type: "apartment",
    listing_type: "rent",
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 130,
    address: "909 Lekki Phase 1",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  },
  
  // Commercial Properties
  {
    title: "Modern Office Space in Lagos Island",
    description: "Grade A office space in prime commercial district with parking.",
    price: 120000000,
    property_type: "commercial",
    listing_type: "sale",
    bedrooms: 0,
    bathrooms: 4,
    area_sqm: 500,
    address: "1010 Lagos Island",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: true,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"]
  },
  {
    title: "Retail Space in Ikeja City Mall",
    description: "Prime retail location in busy shopping mall with high foot traffic.",
    price: 35000000,
    property_type: "commercial",
    listing_type: "sale",
    bedrooms: 0,
    bathrooms: 2,
    area_sqm: 80,
    address: "1111 Ikeja City Mall",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: false,
    verified: true,
    images: ["/placeholder.svg"]
  },
  
  // Land Properties
  {
    title: "Prime Land in Lekki Free Trade Zone",
    description: "Strategically located land perfect for residential or commercial development.",
    price: 15000000,
    property_type: "land",
    listing_type: "sale",
    bedrooms: 0,
    bathrooms: 0,
    area_sqm: 1000,
    address: "1212 Lekki Free Trade Zone",
    city: "Lagos",
    state: "Lagos State",
    country: "Nigeria",
    featured: false,
    verified: true,
    images: ["/placeholder.svg"]
  }
];

async function seedProperties() {
  console.log('Starting to seed properties...');
  
  try {
    // First, let's check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Error connecting to Supabase:', testError);
      return;
    }
    
    console.log('Connected to Supabase successfully');
    
    // Insert properties in batches
    const batchSize = 5;
    for (let i = 0; i < sampleProperties.length; i += batchSize) {
      const batch = sampleProperties.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('properties')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} properties)`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('Finished seeding properties!');
    
    // Get final count
    const { data: countData, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });
    
    if (!countError) {
      console.log(`Total properties in database: ${countData?.length || 0}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the seeding function
seedProperties();
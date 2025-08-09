#!/usr/bin/env node

/**
 * Database Seeding Script
 * 
 * This script populates the database with sample data for development and testing.
 * Run this after setting up your database schema.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const sampleAgents = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    agency_name: 'Lagos Premium Properties',
    license_number: 'LPP2024001',
    phone: '+234-803-123-4567',
    bio: 'Experienced real estate agent specializing in luxury properties in Lagos with over 8 years of experience.',
    verification_status: 'verified',
    rating: 4.8,
    total_reviews: 127,
    years_experience: 8,
    specializations: ['Luxury Properties', 'Residential', 'Investment']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    agency_name: 'Abuja Elite Realty',
    license_number: 'AER2024002',
    phone: '+234-806-987-6543',
    bio: 'Expert in commercial and residential properties in Abuja. Committed to finding the perfect property for every client.',
    verification_status: 'verified',
    rating: 4.6,
    total_reviews: 89,
    years_experience: 6,
    specializations: ['Commercial', 'Residential', 'Land']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    agency_name: 'West Coast Properties',
    license_number: 'WCP2024003',
    phone: '+234-809-555-1234',
    bio: 'Specialist in waterfront and luxury properties across Lagos and Ogun states.',
    verification_status: 'verified',
    rating: 4.9,
    total_reviews: 156,
    years_experience: 12,
    specializations: ['Waterfront', 'Luxury', 'Investment']
  }
];

const sampleProperties = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    title: 'Luxury 3-Bedroom Apartment in Victoria Island',
    description: 'Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes, smart home technology, and access to premium amenities including gym, pool, and 24/7 security.',
    property_type: 'apartment',
    listing_type: 'sale',
    status: 'for_sale',
    price: 45000000.00,
    bedrooms: 3,
    bathrooms: 2,
    area_sqm: 150.00,
    address: '15 Ahmadu Bello Way, Victoria Island',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440001',
    featured: true,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'Generator', 'Elevator', 'Parking'],
    year_built: 2022,
    parking_spaces: 2,
    furnishing_status: 'Fully Furnished',
    seo_slug: 'luxury-3-bedroom-apartment-victoria-island'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    title: 'Modern 4-Bedroom Duplex in Lekki Phase 1',
    description: 'Beautifully designed duplex in a serene and secure estate. Perfect for families with spacious rooms, modern kitchen, and landscaped garden.',
    property_type: 'duplex',
    listing_type: 'sale',
    status: 'for_sale',
    price: 75000000.00,
    bedrooms: 4,
    bathrooms: 3,
    area_sqm: 250.00,
    address: '45 Admiralty Way, Lekki Phase 1',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440001',
    featured: true,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop'
    ],
    amenities: ['Garden', 'Security', 'Generator', 'Parking', 'Balcony', 'Storage Room'],
    year_built: 2021,
    parking_spaces: 3,
    furnishing_status: 'Semi Furnished',
    seo_slug: 'modern-4-bedroom-duplex-lekki-phase-1'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    title: 'Spacious 2-Bedroom Flat in Ikeja GRA',
    description: 'Well-maintained apartment in one of Lagos premier residential areas. Features include spacious living areas, fitted kitchen, and access to estate facilities.',
    property_type: 'apartment',
    listing_type: 'sale',
    status: 'for_sale',
    price: 25000000.00,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 120.00,
    address: '28 Obafemi Awolowo Way, Ikeja GRA',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440002',
    featured: false,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800&h=600&fit=crop'
    ],
    amenities: ['Security', 'Generator', 'Parking', 'Water Treatment'],
    year_built: 2020,
    parking_spaces: 1,
    furnishing_status: 'Unfurnished',
    seo_slug: 'spacious-2-bedroom-flat-ikeja-gra'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    title: 'Executive 5-Bedroom Mansion in Banana Island',
    description: 'Ultra-luxury mansion on exclusive Banana Island. Features include private beach access, infinity pool, home theater, wine cellar, and staff quarters.',
    property_type: 'house',
    listing_type: 'sale',
    status: 'for_sale',
    price: 250000000.00,
    bedrooms: 5,
    bathrooms: 4,
    area_sqm: 400.00,
    address: '12 Ocean Parade Close, Banana Island',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440003',
    featured: true,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600563438938-a42d098c3b5c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600563438901-c2d7c2b6b8b5?w=800&h=600&fit=crop'
    ],
    amenities: ['Private Beach', 'Infinity Pool', 'Home Theater', 'Wine Cellar', 'Staff Quarters', 'Private Jetty', 'Security', 'Generator'],
    year_built: 2023,
    parking_spaces: 4,
    furnishing_status: 'Fully Furnished',
    seo_slug: 'executive-5-bedroom-mansion-banana-island'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    title: 'Contemporary 3-Bedroom Penthouse in Ikoyi',
    description: 'Exclusive penthouse with 360-degree views of Lagos. Features floor-to-ceiling windows, marble finishes, private elevator access, and rooftop terrace.',
    property_type: 'penthouse',
    listing_type: 'sale',
    status: 'for_sale',
    price: 85000000.00,
    bedrooms: 3,
    bathrooms: 3,
    area_sqm: 200.00,
    address: '7 Kingsway Road, Ikoyi',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440001',
    featured: true,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566752734-d1d394c5113a?w=800&h=600&fit=crop'
    ],
    amenities: ['Private Elevator', 'Rooftop Terrace', 'Marble Finishes', 'Central AC', 'Security', 'Parking'],
    year_built: 2022,
    parking_spaces: 2,
    furnishing_status: 'Luxury Furnished',
    seo_slug: 'contemporary-3-bedroom-penthouse-ikoyi'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440006',
    title: 'Luxury 2-Bedroom Apartment for Rent in VI',
    description: 'Premium apartment available for rent in Victoria Island. Fully furnished with modern appliances, gym access, swimming pool, and concierge services.',
    property_type: 'apartment',
    listing_type: 'rent',
    status: 'for_rent',
    price: 2500000.00,
    bedrooms: 2,
    bathrooms: 2,
    area_sqm: 110.00,
    address: '8 Tiamiyu Savage Street, Victoria Island',
    city: 'Lagos',
    state: 'Lagos',
    agent_id: '550e8400-e29b-41d4-a716-446655440001',
    featured: true,
    verified: true,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop'
    ],
    amenities: ['Fully Furnished', 'Swimming Pool', 'Gym', 'Concierge', '24/7 Security', 'Generator'],
    year_built: 2023,
    parking_spaces: 1,
    furnishing_status: 'Fully Furnished',
    seo_slug: 'luxury-2-bedroom-apartment-rent-vi'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Test connection
    const { data: testData, error: testError } = await supabase
      .from('properties')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      process.exit(1);
    }

    console.log('✅ Database connection successful');

    // Check if data already exists
    const { data: existingProperties, error: checkError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking existing data:', checkError.message);
      process.exit(1);
    }

    if (existingProperties && existingProperties.length > 0) {
      console.log('ℹ️  Database already contains data. Skipping seeding.');
      console.log('   Use --force flag to override existing data.');
      return;
    }

    // Seed agents
    console.log('📝 Seeding real estate agents...');
    const { error: agentsError } = await supabase
      .from('real_estate_agents')
      .insert(sampleAgents);

    if (agentsError) {
      console.error('❌ Error seeding agents:', agentsError.message);
      // Continue anyway, agents might already exist
    } else {
      console.log(`✅ Seeded ${sampleAgents.length} agents`);
    }

    // Seed properties
    console.log('🏠 Seeding properties...');
    const { error: propertiesError } = await supabase
      .from('properties')
      .insert(sampleProperties);

    if (propertiesError) {
      console.error('❌ Error seeding properties:', propertiesError.message);
      process.exit(1);
    }

    console.log(`✅ Seeded ${sampleProperties.length} properties`);

    // Verify seeding
    const { data: finalCount, error: countError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });

    if (!countError) {
      console.log(`📊 Total properties in database: ${finalCount?.length || 0}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run your application: npm run dev');
    console.log('2. Visit the properties page to see the seeded data');
    console.log('3. Test the search and filtering functionality');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const forceFlag = args.includes('--force');

if (forceFlag) {
  console.log('⚠️  Force flag detected. This will override existing data.');
}

seedDatabase();
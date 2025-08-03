
-- Create custom types
CREATE TYPE property_type AS ENUM ('apartment', 'house', 'duplex', 'penthouse', 'land', 'commercial', 'office');
CREATE TYPE property_status AS ENUM ('for_sale', 'for_rent', 'sold', 'rented', 'off_market');
CREATE TYPE listing_type AS ENUM ('sale', 'rent');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Real estate agents table
CREATE TABLE real_estate_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name TEXT,
  license_number TEXT,
  phone TEXT,
  bio TEXT,
  profile_image_url TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  years_experience INTEGER,
  specializations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Properties table
CREATE TABLE properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  listing_type listing_type NOT NULL,
  status property_status DEFAULT 'for_sale',
  price DECIMAL(15,2) NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm DECIMAL(10,2),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT DEFAULT 'Nigeria',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  agent_id UUID REFERENCES real_estate_agents(id),
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  year_built INTEGER,
  parking_spaces INTEGER,
  furnishing_status TEXT,
  property_documents JSONB DEFAULT '{}',
  virtual_tour_url TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Property favorites table
CREATE TABLE property_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Property inquiries table
CREATE TABLE property_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES real_estate_agents(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  preferred_contact_method TEXT DEFAULT 'email',
  status TEXT DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Property reviews table
CREATE TABLE property_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agent reviews table
CREATE TABLE agent_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES real_estate_agents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Property viewings/tours table
CREATE TABLE property_viewings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES real_estate_agents(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Search history table
CREATE TABLE search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT,
  filters JSONB DEFAULT '{}',
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE real_estate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties (public read, authenticated users can create/update their own)
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Agents can insert their own properties" ON properties FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
);
CREATE POLICY "Agents can update their own properties" ON properties FOR UPDATE USING (
  EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
);

-- RLS Policies for agents (public read, users can create/update their own profile)
CREATE POLICY "Agents are viewable by everyone" ON real_estate_agents FOR SELECT USING (true);
CREATE POLICY "Users can create their own agent profile" ON real_estate_agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own agent profile" ON real_estate_agents FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for favorites (users can only see/manage their own)
CREATE POLICY "Users can view their own favorites" ON property_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own favorites" ON property_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON property_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inquiries
CREATE POLICY "Users can view their own inquiries" ON property_inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can view inquiries for their properties" ON property_inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
);
CREATE POLICY "Authenticated users can create inquiries" ON property_inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone" ON property_reviews FOR SELECT USING (true);
CREATE POLICY "Reviews are viewable by everyone" ON agent_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON property_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can create their own reviews" ON agent_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for viewings
CREATE POLICY "Users can view their own viewings" ON property_viewings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Agents can view viewings for their properties" ON property_viewings FOR SELECT USING (
  EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create viewings" ON property_viewings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for search history
CREATE POLICY "Users can view their own search history" ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own search history" ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample properties data
INSERT INTO real_estate_agents (id, agency_name, license_number, phone, bio, verification_status, rating, total_reviews, years_experience) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Lagos Premium Properties', 'LPP2024001', '+234-803-123-4567', 'Experienced real estate agent specializing in luxury properties in Lagos with over 8 years of experience.', 'verified', 4.8, 127, 8),
('550e8400-e29b-41d4-a716-446655440002', 'Abuja Elite Realty', 'AER2024002', '+234-806-987-6543', 'Expert in commercial and residential properties in Abuja. Committed to finding the perfect property for every client.', 'verified', 4.6, 89, 6),
('550e8400-e29b-41d4-a716-446655440003', 'West Coast Properties', 'WCP2024003', '+234-809-555-1234', 'Specialist in waterfront and luxury properties across Lagos and Ogun states.', 'verified', 4.9, 156, 12),
('550e8400-e29b-41d4-a716-446655440004', 'Northern Gate Realty', 'NGR2024004', '+234-812-777-8888', 'Focused on affordable housing and investment properties in Kano and surrounding areas.', 'verified', 4.5, 73, 5);

INSERT INTO properties (id, title, description, property_type, listing_type, status, price, bedrooms, bathrooms, area_sqm, address, city, state, agent_id, featured, verified, images, amenities, year_built, parking_spaces, furnishing_status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Luxury 3-Bedroom Apartment in Victoria Island', 'Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes, smart home technology, and access to premium amenities including gym, pool, and 24/7 security.', 'apartment', 'sale', 'for_sale', 45000000.00, 3, 2, 150.00, '15 Ahmadu Bello Way, Victoria Island', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440001', true, true, ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], ARRAY['Swimming Pool', 'Gym', '24/7 Security', 'Generator', 'Elevator', 'Parking'], 2022, 2, 'Fully Furnished'),

('660e8400-e29b-41d4-a716-446655440002', 'Modern 4-Bedroom Duplex in Lekki Phase 1', 'Beautifully designed duplex in a serene and secure estate. Perfect for families with spacious rooms, modern kitchen, and landscaped garden. Close to schools, shopping centers, and recreational facilities.', 'duplex', 'sale', 'for_sale', 75000000.00, 4, 3, 250.00, '45 Admiralty Way, Lekki Phase 1', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440001', true, true, ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], ARRAY['Garden', 'Security', 'Generator', 'Parking', 'Balcony', 'Storage Room'], 2021, 3, 'Semi Furnished'),

('660e8400-e29b-41d4-a716-446655440003', 'Spacious 2-Bedroom Flat in Ikeja GRA', 'Well-maintained apartment in one of Lagos premier residential areas. Features include spacious living areas, fitted kitchen, and access to estate facilities. Ideal for young professionals and small families.', 'apartment', 'sale', 'for_sale', 25000000.00, 2, 2, 120.00, '28 Obafemi Awolowo Way, Ikeja GRA', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440002', false, true, ARRAY['/placeholder.svg', '/placeholder.svg'], ARRAY['Security', 'Generator', 'Parking', 'Water Treatment'], 2020, 1, 'Unfurnished'),

('660e8400-e29b-41d4-a716-446655440004', 'Executive 5-Bedroom Mansion in Banana Island', 'Ultra-luxury mansion on exclusive Banana Island. Features include private beach access, infinity pool, home theater, wine cellar, and staff quarters. The epitome of luxury living in Lagos.', 'house', 'sale', 'for_sale', 250000000.00, 5, 4, 400.00, '12 Ocean Parade Close, Banana Island', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440003', true, true, ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], ARRAY['Private Beach', 'Infinity Pool', 'Home Theater', 'Wine Cellar', 'Staff Quarters', 'Private Jetty', 'Security', 'Generator'], 2023, 4, 'Fully Furnished'),

('660e8400-e29b-41d4-a716-446655440005', 'Contemporary 3-Bedroom Penthouse in Ikoyi', 'Exclusive penthouse with 360-degree views of Lagos. Features floor-to-ceiling windows, marble finishes, private elevator access, and rooftop terrace. Located in the heart of Ikoyi with easy access to business district.', 'penthouse', 'sale', 'for_sale', 85000000.00, 3, 3, 200.00, '7 Kingsway Road, Ikoyi', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440001', true, true, ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'], ARRAY['Private Elevator', 'Rooftop Terrace', 'Marble Finishes', 'Central AC', 'Security', 'Parking'], 2022, 2, 'Luxury Furnished'),

('660e8400-e29b-41d4-a716-446655440006', 'Elegant 4-Bedroom Terrace in Abuja', 'Modern terrace house in upscale Abuja neighborhood. Features contemporary design, landscaped compound, and proximity to international schools and shopping centers. Perfect for expatriate families.', 'house', 'sale', 'for_sale', 55000000.00, 4, 3, 180.00, '15 Diplomatic Drive, Katampe Extension', 'Abuja', 'FCT', '550e8400-e29b-41d4-a716-446655440002', false, true, ARRAY['/placeholder.svg', '/placeholder.svg'], ARRAY['Landscaped Garden', 'Security', 'Generator', 'Parking', 'Study Room'], 2021, 2, 'Semi Furnished'),

('660e8400-e29b-41d4-a716-446655440007', 'Affordable 3-Bedroom Bungalow in Kano', 'Comfortable family home in peaceful residential area. Features include spacious compound, modern fittings, and reliable infrastructure. Great value for money and perfect for first-time buyers.', 'house', 'sale', 'for_sale', 18000000.00, 3, 2, 140.00, '22 Zaria Road, Fagge', 'Kano', 'Kano', '550e8400-e29b-41d4-a716-446655440004', false, true, ARRAY['/placeholder.svg'], ARRAY['Compound', 'Security', 'Borehole', 'Parking'], 2019, 2, 'Unfurnished'),

('660e8400-e29b-41d4-a716-446655440008', 'Luxury 2-Bedroom Apartment for Rent in VI', 'Premium apartment available for rent in Victoria Island. Fully furnished with modern appliances, gym access, swimming pool, and concierge services. Ideal for executives and expatriates.', 'apartment', 'rent', 'for_rent', 2500000.00, 2, 2, 110.00, '8 Tiamiyu Savage Street, Victoria Island', 'Lagos', 'Lagos', '550e8400-e29b-41d4-a716-446655440001', true, true, ARRAY['/placeholder.svg', '/placeholder.svg'], ARRAY['Fully Furnished', 'Swimming Pool', 'Gym', 'Concierge', '24/7 Security', 'Generator'], 2023, 1, 'Fully Furnished');

-- Create indexes for better performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_featured ON properties(featured);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_agent_id ON property_inquiries(agent_id);

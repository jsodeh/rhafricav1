-- =====================================================
-- Real Estate Hotspot - Clean Database Setup
-- =====================================================
-- Fresh, optimized database setup for Supabase
-- Run this script in your Supabase project's SQL Editor

-- =====================================================
-- CLEAN SLATE: Drop existing objects if they exist
-- =====================================================
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS search_history CASCADE;
DROP TABLE IF EXISTS property_viewings CASCADE;
DROP TABLE IF EXISTS agent_reviews CASCADE;
DROP TABLE IF EXISTS property_reviews CASCADE;
DROP TABLE IF EXISTS property_inquiries CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS real_estate_agents CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS listing_type CASCADE;
DROP TYPE IF EXISTS property_status CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================
CREATE TYPE property_type AS ENUM (
    'apartment', 
    'house', 
    'duplex', 
    'penthouse', 
    'land', 
    'commercial', 
    'office'
);

CREATE TYPE property_status AS ENUM (
    'for_sale', 
    'for_rent', 
    'sold', 
    'rented', 
    'off_market'
);

CREATE TYPE listing_type AS ENUM (
    'sale', 
    'rent'
);

CREATE TYPE verification_status AS ENUM (
    'pending', 
    'verified', 
    'rejected'
);

CREATE TYPE account_type AS ENUM (
    'buyer', 
    'seller', 
    'agent', 
    'admin', 
    'owner', 
    'renter'
);

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    account_type account_type DEFAULT 'buyer',
    bio TEXT,
    location TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REAL ESTATE AGENTS TABLE
-- =====================================================
CREATE TABLE real_estate_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_name TEXT,
    license_number TEXT UNIQUE,
    phone TEXT,
    bio TEXT,
    profile_image_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    years_experience INTEGER CHECK (years_experience >= 0),
    specializations TEXT[],
    social_media JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    listing_type listing_type NOT NULL,
    status property_status DEFAULT 'for_sale',
    price DECIMAL(15,2) NOT NULL CHECK (price > 0),
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms INTEGER CHECK (bathrooms >= 0),
    area_sqm DECIMAL(10,2) CHECK (area_sqm > 0),
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    agent_id UUID REFERENCES real_estate_agents(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    year_built INTEGER CHECK (year_built > 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 5),
    parking_spaces INTEGER DEFAULT 0 CHECK (parking_spaces >= 0),
    furnishing_status TEXT,
    property_documents JSONB DEFAULT '{}',
    virtual_tour_url TEXT,
    views_count INTEGER DEFAULT 0 CHECK (views_count >= 0),
    seo_slug TEXT UNIQUE,
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPERTY FAVORITES TABLE
-- =====================================================
CREATE TABLE property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- =====================================================
-- PROPERTY INQUIRIES TABLE
-- =====================================================
CREATE TABLE property_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES real_estate_agents(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    preferred_contact_method TEXT DEFAULT 'email',
    status TEXT DEFAULT 'pending',
    response TEXT,
    inquiry_type TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PROPERTY REVIEWS TABLE
-- =====================================================
CREATE TABLE property_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- =====================================================
-- AGENT REVIEWS TABLE
-- =====================================================
CREATE TABLE agent_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES real_estate_agents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    helpful_count INTEGER DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, agent_id)
);

-- =====================================================
-- PROPERTY VIEWINGS TABLE
-- =====================================================
CREATE TABLE property_viewings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES real_estate_agents(id) ON DELETE SET NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    viewing_type TEXT DEFAULT 'physical' CHECK (viewing_type IN ('physical', 'virtual')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEARCH HISTORY TABLE
-- =====================================================
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0 CHECK (results_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SAVED SEARCHES TABLE
-- =====================================================
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    search_criteria JSONB NOT NULL,
    email_alerts BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Properties indexes
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_state ON properties(state);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_featured ON properties(featured) WHERE featured = TRUE;
CREATE INDEX idx_properties_verified ON properties(verified) WHERE verified = TRUE;
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_location ON properties(latitude, longitude);
CREATE INDEX idx_properties_created ON properties(created_at);

-- User-related indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_agents_user_id ON real_estate_agents(user_id);
CREATE INDEX idx_agents_verification ON real_estate_agents(verification_status);

-- Activity indexes
CREATE INDEX idx_favorites_user ON property_favorites(user_id);
CREATE INDEX idx_favorites_property ON property_favorites(property_id);
CREATE INDEX idx_inquiries_property ON property_inquiries(property_id);
CREATE INDEX idx_inquiries_user ON property_inquiries(user_id);
CREATE INDEX idx_inquiries_agent ON property_inquiries(agent_id);
CREATE INDEX idx_reviews_property ON property_reviews(property_id);
CREATE INDEX idx_reviews_agent ON agent_reviews(agent_id);
CREATE INDEX idx_viewings_property ON property_viewings(property_id);
CREATE INDEX idx_viewings_user ON property_viewings(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_search_history_user ON search_history(user_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- User Profiles Policies
CREATE POLICY "Users can view their own profile" 
    ON user_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
    ON user_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
    ON user_profiles FOR UPDATE 
    USING (auth.uid() = user_id);

-- Real Estate Agents Policies
CREATE POLICY "Agents are viewable by everyone" 
    ON real_estate_agents FOR SELECT 
    USING (TRUE);

CREATE POLICY "Users can create their own agent profile" 
    ON real_estate_agents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent profile" 
    ON real_estate_agents FOR UPDATE 
    USING (auth.uid() = user_id);

-- Properties Policies
CREATE POLICY "Properties are viewable by everyone" 
    ON properties FOR SELECT 
    USING (TRUE);

CREATE POLICY "Property owners and agents can insert properties" 
    ON properties FOR INSERT 
    WITH CHECK (
        auth.uid() = owner_id OR 
        EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
    );

CREATE POLICY "Property owners and agents can update properties" 
    ON properties FOR UPDATE 
    USING (
        auth.uid() = owner_id OR 
        EXISTS (SELECT 1 FROM real_estate_agents WHERE id = agent_id AND user_id = auth.uid())
    );

-- Property Favorites Policies
CREATE POLICY "Users can manage their own favorites" 
    ON property_favorites FOR ALL 
    USING (auth.uid() = user_id);

-- Property Inquiries Policies
CREATE POLICY "Users can view their own inquiries" 
    ON property_inquiries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Agents can view inquiries for their properties" 
    ON property_inquiries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM real_estate_agents ra 
            WHERE ra.id = agent_id AND ra.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create inquiries" 
    ON property_inquiries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and agents can update inquiries" 
    ON property_inquiries FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM real_estate_agents ra 
            WHERE ra.id = agent_id AND ra.user_id = auth.uid()
        )
    );

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" 
    ON property_reviews FOR SELECT 
    USING (TRUE);

CREATE POLICY "Agent reviews are viewable by everyone" 
    ON agent_reviews FOR SELECT 
    USING (TRUE);

CREATE POLICY "Users can create their own property reviews" 
    ON property_reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent reviews" 
    ON agent_reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Property Viewings Policies
CREATE POLICY "Users can view their own viewings" 
    ON property_viewings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Agents can view viewings for their properties" 
    ON property_viewings FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM real_estate_agents ra 
            WHERE ra.id = agent_id AND ra.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create viewings" 
    ON property_viewings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and agents can update viewings" 
    ON property_viewings FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM real_estate_agents ra 
            WHERE ra.id = agent_id AND ra.user_id = auth.uid()
        )
    );

-- Search History and Notifications Policies
CREATE POLICY "Users can manage their own search history" 
    ON search_history FOR ALL 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own saved searches" 
    ON saved_searches FOR ALL 
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_agents_updated_at ON real_estate_agents;
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_inquiries_updated_at ON property_inquiries;
DROP TRIGGER IF EXISTS update_viewings_updated_at ON property_viewings;
DROP TRIGGER IF EXISTS update_saved_searches_updated_at ON saved_searches;
DROP TRIGGER IF EXISTS update_agent_rating_on_insert ON agent_reviews;
DROP TRIGGER IF EXISTS update_agent_rating_on_update ON agent_reviews;
DROP TRIGGER IF EXISTS update_agent_rating_on_delete ON agent_reviews;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at 
    BEFORE UPDATE ON real_estate_agents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at 
    BEFORE UPDATE ON properties 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at 
    BEFORE UPDATE ON property_inquiries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viewings_updated_at 
    BEFORE UPDATE ON property_viewings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at 
    BEFORE UPDATE ON saved_searches 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update agent rating when reviews are added/updated
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE real_estate_agents 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 1) 
            FROM agent_reviews 
            WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM agent_reviews 
            WHERE agent_id = COALESCE(NEW.agent_id, OLD.agent_id)
        )
    WHERE id = COALESCE(NEW.agent_id, OLD.agent_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for agent rating updates
CREATE TRIGGER update_agent_rating_on_insert
    AFTER INSERT ON agent_reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

CREATE TRIGGER update_agent_rating_on_update
    AFTER UPDATE ON agent_reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

CREATE TRIGGER update_agent_rating_on_delete
    AFTER DELETE ON agent_reviews
    FOR EACH ROW EXECUTE FUNCTION update_agent_rating();

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert sample agents
INSERT INTO real_estate_agents (
    id, agency_name, license_number, phone, bio, 
    verification_status, rating, total_reviews, years_experience, specializations
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Lagos Premium Properties',
    'LPP2024001',
    '+234-803-123-4567',
    'Experienced real estate agent specializing in luxury properties in Lagos with over 8 years of experience.',
    'verified',
    4.8,
    127,
    8,
    ARRAY['Luxury Properties', 'Residential', 'Investment']
),
(
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'Abuja Elite Realty',
    'AER2024002',
    '+234-806-987-6543',
    'Expert in commercial and residential properties in Abuja. Committed to finding the perfect property for every client.',
    'verified',
    4.6,
    89,
    6,
    ARRAY['Commercial', 'Residential', 'Land']
),
(
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    'West Coast Properties',
    'WCP2024003',
    '+234-809-555-1234',
    'Specialist in waterfront and luxury properties across Lagos and Ogun states.',
    'verified',
    4.9,
    156,
    12,
    ARRAY['Waterfront', 'Luxury', 'Investment']
),
(
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    'Northern Gate Realty',
    'NGR2024004',
    '+234-812-777-8888',
    'Focused on affordable housing and investment properties in Kano and surrounding areas.',
    'verified',
    4.5,
    73,
    5,
    ARRAY['Affordable Housing', 'Investment', 'Land']
);

-- Insert sample properties
INSERT INTO properties (
    id, title, description, property_type, listing_type, status, price,
    bedrooms, bathrooms, area_sqm, address, city, state, agent_id,
    featured, verified, images, amenities, year_built, parking_spaces,
    furnishing_status, seo_slug
) VALUES 
(
    '660e8400-e29b-41d4-a716-446655440001'::uuid,
    'Luxury 3-Bedroom Apartment in Victoria Island',
    'Stunning modern apartment with panoramic views of Lagos lagoon. Features high-end finishes, smart home technology, and access to premium amenities including gym, pool, and 24/7 security.',
    'apartment',
    'sale',
    'for_sale',
    45000000.00,
    3,
    2,
    150.00,
    '15 Ahmadu Bello Way, Victoria Island',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    TRUE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    ARRAY['Swimming Pool', 'Gym', '24/7 Security', 'Generator', 'Elevator', 'Parking'],
    2022,
    2,
    'Fully Furnished',
    'luxury-3-bedroom-apartment-victoria-island'
),
(
    '660e8400-e29b-41d4-a716-446655440002'::uuid,
    'Modern 4-Bedroom Duplex in Lekki Phase 1',
    'Beautifully designed duplex in a serene and secure estate. Perfect for families with spacious rooms, modern kitchen, and landscaped garden.',
    'duplex',
    'sale',
    'for_sale',
    75000000.00,
    4,
    3,
    250.00,
    '45 Admiralty Way, Lekki Phase 1',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    TRUE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    ARRAY['Garden', 'Security', 'Generator', 'Parking', 'Balcony', 'Storage Room'],
    2021,
    3,
    'Semi Furnished',
    'modern-4-bedroom-duplex-lekki-phase-1'
),
(
    '660e8400-e29b-41d4-a716-446655440003'::uuid,
    'Spacious 2-Bedroom Flat in Ikeja GRA',
    'Well-maintained apartment in one of Lagos premier residential areas. Features include spacious living areas, fitted kitchen, and access to estate facilities.',
    'apartment',
    'sale',
    'for_sale',
    25000000.00,
    2,
    2,
    120.00,
    '28 Obafemi Awolowo Way, Ikeja GRA',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    FALSE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg'],
    ARRAY['Security', 'Generator', 'Parking', 'Water Treatment'],
    2020,
    1,
    'Unfurnished',
    'spacious-2-bedroom-flat-ikeja-gra'
),
(
    '660e8400-e29b-41d4-a716-446655440004'::uuid,
    'Executive 5-Bedroom Mansion in Banana Island',
    'Ultra-luxury mansion on exclusive Banana Island. Features include private beach access, infinity pool, home theater, wine cellar, and staff quarters.',
    'house',
    'sale',
    'for_sale',
    250000000.00,
    5,
    4,
    400.00,
    '12 Ocean Parade Close, Banana Island',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440003'::uuid,
    TRUE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    ARRAY['Private Beach', 'Infinity Pool', 'Home Theater', 'Wine Cellar', 'Staff Quarters', 'Private Jetty', 'Security', 'Generator'],
    2023,
    4,
    'Fully Furnished',
    'executive-5-bedroom-mansion-banana-island'
),
(
    '660e8400-e29b-41d4-a716-446655440005'::uuid,
    'Contemporary 3-Bedroom Penthouse in Ikoyi',
    'Exclusive penthouse with 360-degree views of Lagos. Features floor-to-ceiling windows, marble finishes, private elevator access, and rooftop terrace.',
    'penthouse',
    'sale',
    'for_sale',
    85000000.00,
    3,
    3,
    200.00,
    '7 Kingsway Road, Ikoyi',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    TRUE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    ARRAY['Private Elevator', 'Rooftop Terrace', 'Marble Finishes', 'Central AC', 'Security', 'Parking'],
    2022,
    2,
    'Luxury Furnished',
    'contemporary-3-bedroom-penthouse-ikoyi'
),
(
    '660e8400-e29b-41d4-a716-446655440006'::uuid,
    'Elegant 4-Bedroom Terrace in Abuja',
    'Modern terrace house in upscale Abuja neighborhood. Features contemporary design, landscaped compound, and proximity to international schools.',
    'house',
    'sale',
    'for_sale',
    55000000.00,
    4,
    3,
    180.00,
    '15 Diplomatic Drive, Katampe Extension',
    'Abuja',
    'FCT',
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    FALSE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg'],
    ARRAY['Landscaped Garden', 'Security', 'Generator', 'Parking', 'Study Room'],
    2021,
    2,
    'Semi Furnished',
    'elegant-4-bedroom-terrace-abuja'
),
(
    '660e8400-e29b-41d4-a716-446655440007'::uuid,
    'Affordable 3-Bedroom Bungalow in Kano',
    'Comfortable family home in peaceful residential area. Features include spacious compound, modern fittings, and reliable infrastructure.',
    'house',
    'sale',
    'for_sale',
    18000000.00,
    3,
    2,
    140.00,
    '22 Zaria Road, Fagge',
    'Kano',
    'Kano',
    '550e8400-e29b-41d4-a716-446655440004'::uuid,
    FALSE,
    TRUE,
    ARRAY['/placeholder.svg'],
    ARRAY['Compound', 'Security', 'Borehole', 'Parking'],
    2019,
    2,
    'Unfurnished',
    'affordable-3-bedroom-bungalow-kano'
),
(
    '660e8400-e29b-41d4-a716-446655440008'::uuid,
    'Luxury 2-Bedroom Apartment for Rent in VI',
    'Premium apartment available for rent in Victoria Island. Fully furnished with modern appliances, gym access, swimming pool, and concierge services.',
    'apartment',
    'rent',
    'for_rent',
    2500000.00,
    2,
    2,
    110.00,
    '8 Tiamiyu Savage Street, Victoria Island',
    'Lagos',
    'Lagos',
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    TRUE,
    TRUE,
    ARRAY['/placeholder.svg', '/placeholder.svg'],
    ARRAY['Fully Furnished', 'Swimming Pool', 'Gym', 'Concierge', '24/7 Security', 'Generator'],
    2023,
    1,
    'Fully Furnished',
    'luxury-2-bedroom-apartment-rent-vi'
);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your clean database is now ready with:
-- ✅ All tables created with proper constraints
-- ✅ Optimized indexes for performance
-- ✅ Row Level Security enabled with comprehensive policies
-- ✅ Automatic triggers for updated_at timestamps
-- ✅ Agent rating calculation triggers
-- ✅ Sample data with proper UUID casting
-- ✅ Clean, maintainable structure
-- 
-- Next steps:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Test with your seeding scripts
-- 3. Verify RLS policies work as expected
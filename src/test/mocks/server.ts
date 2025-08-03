import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock API responses
export const handlers = [
  // Auth endpoints
  http.post('/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
        },
      },
    });
  }),

  http.get('/auth/v1/user', () => {
    return HttpResponse.json({
      id: 'mock-user-id',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
      },
    });
  }),

  // Properties endpoints
  http.get('/rest/v1/properties', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Modern Apartment',
        description: 'A beautiful modern apartment in the city center',
        price: 250000,
        location: 'Lagos, Nigeria',
        bedrooms: 3,
        bathrooms: 2,
        area: 1200,
        property_type: 'apartment',
        listing_type: 'sale',
        images: ['/api/placeholder/400/300'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Family House',
        description: 'Perfect family home with garden',
        price: 450000,
        location: 'Abuja, Nigeria',
        bedrooms: 4,
        bathrooms: 3,
        area: 2000,
        property_type: 'house',
        listing_type: 'sale',
        images: ['/api/placeholder/400/300'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),

  http.get('/rest/v1/properties/:id', ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      title: 'Modern Apartment',
      description: 'A beautiful modern apartment in the city center',
      price: 250000,
      location: 'Lagos, Nigeria',
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      property_type: 'apartment',
      listing_type: 'sale',
      images: ['/api/placeholder/400/300'],
      features: ['Air Conditioning', 'Swimming Pool', 'Parking'],
      agent_id: 'agent-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // Agents endpoints
  http.get('/rest/v1/agents', () => {
    return HttpResponse.json([
      {
        id: 'agent-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+234-123-456-7890',
        bio: 'Experienced real estate agent',
        avatar: '/api/placeholder/150/150',
        rating: 4.8,
        total_sales: 25,
        specialties: ['Residential', 'Commercial'],
        created_at: new Date().toISOString(),
      },
      {
        id: 'agent-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+234-987-654-3210',
        bio: 'Professional property consultant',
        avatar: '/api/placeholder/150/150',
        rating: 4.9,
        total_sales: 30,
        specialties: ['Luxury Homes', 'Investment'],
        created_at: new Date().toISOString(),
      },
    ]);
  }),

  // Search endpoints
  http.get('/rest/v1/search/properties', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    return HttpResponse.json({
      results: [
        {
          id: '1',
          title: `Search Result for "${query}"`,
          description: 'Matching property description',
          price: 300000,
          location: 'Lagos, Nigeria',
          property_type: 'apartment',
          images: ['/api/placeholder/400/300'],
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    });
  }),

  // Contact form endpoint
  http.post('/rest/v1/contact_forms', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'contact-1',
      ...body,
      created_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Analytics endpoints
  http.post('https://www.google-analytics.com/mp/collect', () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // External APIs
  http.get('https://api.mapbox.com/*', () => {
    return HttpResponse.json({
      features: [
        {
          place_name: 'Lagos, Nigeria',
          center: [3.3792, 6.5244],
          geometry: {
            coordinates: [3.3792, 6.5244],
          },
        },
      ],
    });
  }),

  // Paystack API mocks
  http.post('https://api.paystack.co/transaction/initialize', () => {
    return HttpResponse.json({
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: 'https://checkout.paystack.com/test-auth-url',
        access_code: 'test-access-code',
        reference: 'test-reference',
      },
    });
  }),

  // File upload mock
  http.post('/storage/v1/object/*', () => {
    return HttpResponse.json({
      Id: 'uploaded-file-id',
      Key: 'test-file.jpg',
      Location: 'https://example.com/test-file.jpg',
    });
  }),

  // Default handler for unmatched requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled ${request.method} request to ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];

export const server = setupServer(...handlers);

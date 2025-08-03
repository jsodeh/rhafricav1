// SEO utilities for Real Estate Hotspot

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: any;
}

export interface PropertySEO {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  images?: string[];
  agent?: {
    name: string;
    phone: string;
    email: string;
  };
}

export interface AgentSEO {
  id: string;
  name: string;
  title: string;
  description: string;
  location: string;
  experience: number;
  properties: number;
  rating: number;
  reviews: number;
  image?: string;
  specializations?: string[];
}

class SEOManager {
  private defaultConfig: SEOConfig = {
    title: 'Real Estate Hotspot - Nigeria\'s Most Trusted Property Platform',
    description: 'Nigeria\'s premier real estate platform connecting buyers, sellers, agents, and service providers. Find verified properties, trusted agents, and professional services with secure transactions and escrow protection.',
    keywords: [
      'Nigeria real estate',
      'property for sale', 
      'property for rent',
      'Lagos properties',
      'Abuja properties',
      'real estate agents',
      'property investment',
      'verified listings',
      'secure transactions'
    ],
    ogType: 'website',
    twitterCard: 'summary_large_image'
  };

  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_URL || 'https://realestatehotspot.com';
  }

  /**
   * Update document head with SEO tags
   */
  updateHead(config: Partial<SEOConfig>): void {
    const finalConfig = { ...this.defaultConfig, ...config };

    // Update title
    document.title = finalConfig.title;

    // Update or create meta tags
    this.updateMetaTag('description', finalConfig.description);
    
    if (finalConfig.keywords) {
      this.updateMetaTag('keywords', finalConfig.keywords.join(', '));
    }

    // Open Graph tags
    this.updateMetaProperty('og:title', finalConfig.ogTitle || finalConfig.title);
    this.updateMetaProperty('og:description', finalConfig.ogDescription || finalConfig.description);
    this.updateMetaProperty('og:type', finalConfig.ogType || 'website');
    this.updateMetaProperty('og:url', finalConfig.canonical || window.location.href);
    
    if (finalConfig.ogImage) {
      this.updateMetaProperty('og:image', this.resolveImageUrl(finalConfig.ogImage));
      this.updateMetaProperty('og:image:width', '1200');
      this.updateMetaProperty('og:image:height', '630');
    }

    // Twitter tags
    this.updateMetaName('twitter:card', finalConfig.twitterCard || 'summary_large_image');
    this.updateMetaName('twitter:title', finalConfig.ogTitle || finalConfig.title);
    this.updateMetaName('twitter:description', finalConfig.ogDescription || finalConfig.description);
    
    if (finalConfig.ogImage) {
      this.updateMetaName('twitter:image', this.resolveImageUrl(finalConfig.ogImage));
    }

    // Canonical URL
    if (finalConfig.canonical) {
      this.updateLink('canonical', finalConfig.canonical);
    }

    // Robots meta
    const robotsContent = this.buildRobotsContent(finalConfig);
    if (robotsContent) {
      this.updateMetaName('robots', robotsContent);
    }

    // Structured data
    if (finalConfig.structuredData) {
      this.updateStructuredData(finalConfig.structuredData);
    }
  }

  /**
   * Generate SEO config for property pages
   */
  generatePropertySEO(property: PropertySEO): SEOConfig {
    const title = `${property.title} - ₦${property.price.toLocaleString()} | Real Estate Hotspot`;
    const description = `${property.description} Located in ${property.location}. ${property.bedrooms ? `${property.bedrooms} bedrooms` : ''} ${property.bathrooms ? `${property.bathrooms} bathrooms` : ''} ${property.area ? `${property.area} sqm` : ''}. Contact verified agent today.`;

    const keywords = [
      property.type.toLowerCase(),
      property.location.toLowerCase(),
      `${property.bedrooms} bedroom`,
      'Nigeria property',
      'real estate',
      'property for sale',
      property.location.toLowerCase() + ' property'
    ].filter(Boolean);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateListing',
      'name': property.title,
      'description': property.description,
      'url': `${this.baseUrl}/properties/${property.id}`,
      'image': property.images?.[0] ? this.resolveImageUrl(property.images[0]) : undefined,
      'offers': {
        '@type': 'Offer',
        'price': property.price,
        'priceCurrency': 'NGN',
        'availability': 'https://schema.org/InStock'
      },
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': property.location,
        'addressCountry': 'Nigeria'
      },
      'floorSize': property.area ? {
        '@type': 'QuantitativeValue',
        'value': property.area,
        'unitCode': 'MTK'
      } : undefined,
      'numberOfRooms': property.bedrooms,
      'numberOfBathroomsTotal': property.bathrooms
    };

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: property.images?.[0],
      ogType: 'product',
      canonical: `${this.baseUrl}/properties/${property.id}`,
      structuredData
    };
  }

  /**
   * Generate SEO config for agent pages
   */
  generateAgentSEO(agent: AgentSEO): SEOConfig {
    const title = `${agent.name} - ${agent.title} | Real Estate Hotspot`;
    const description = `${agent.description} ${agent.experience} years experience in ${agent.location}. ${agent.properties} properties listed. Rated ${agent.rating}/5 from ${agent.reviews} reviews. Contact verified agent today.`;

    const keywords = [
      'real estate agent',
      agent.name.toLowerCase(),
      agent.location.toLowerCase() + ' agent',
      'property agent Nigeria',
      'verified agent',
      ...(agent.specializations || [])
    ];

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'RealEstateAgent',
      'name': agent.name,
      'jobTitle': agent.title,
      'description': agent.description,
      'url': `${this.baseUrl}/agents/${agent.id}`,
      'image': agent.image ? this.resolveImageUrl(agent.image) : undefined,
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': agent.location,
        'addressCountry': 'Nigeria'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': agent.rating,
        'reviewCount': agent.reviews,
        'bestRating': 5,
        'worstRating': 1
      },
      'hasCredential': {
        '@type': 'EducationalOccupationalCredential',
        'credentialCategory': 'Real Estate License'
      }
    };

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: agent.image,
      ogType: 'profile',
      canonical: `${this.baseUrl}/agents/${agent.id}`,
      structuredData
    };
  }

  /**
   * Generate SEO config for search results
   */
  generateSearchSEO(query: string, location?: string, filters?: any): SEOConfig {
    const locationText = location ? ` in ${location}` : ' in Nigeria';
    const title = `${query} Properties${locationText} | Real Estate Hotspot`;
    const description = `Find ${query.toLowerCase()} properties${locationText}. Browse verified listings, compare prices, and contact trusted agents. Nigeria's most comprehensive property search.`;

    const keywords = [
      query.toLowerCase(),
      'property search',
      'Nigeria real estate',
      ...(location ? [location.toLowerCase() + ' properties'] : []),
      'verified listings',
      'property for sale',
      'property for rent'
    ];

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      canonical: `${this.baseUrl}/search?q=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ''}`
    };
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': crumb.url
      }))
    };
  }

  /**
   * Generate organization structured data
   */
  generateOrganizationStructuredData(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Real Estate Hotspot',
      'description': 'Nigeria\'s premier real estate platform',
      'url': this.baseUrl,
      'logo': `${this.baseUrl}/logo.png`,
      'sameAs': [
        'https://facebook.com/realestatehotspot',
        'https://twitter.com/realestatehotspot',
        'https://instagram.com/realestatehotspot'
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+234-XXX-XXXX',
        'contactType': 'Customer Service',
        'availableLanguage': 'English'
      }
    };
  }

  private updateMetaTag(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private updateMetaProperty(property: string, content: string): void {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private updateMetaName(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private updateLink(rel: string, href: string): void {
    let link = document.querySelector(`link[rel="${rel}"]`);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private updateStructuredData(data: any): void {
    // Remove existing structured data
    const existing = document.querySelector('script[type="application/ld+json"]');
    if (existing) {
      existing.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  private buildRobotsContent(config: SEOConfig): string | null {
    const directives: string[] = [];
    
    if (config.noindex) directives.push('noindex');
    else directives.push('index');
    
    if (config.nofollow) directives.push('nofollow');
    else directives.push('follow');

    return directives.length > 0 ? directives.join(', ') : null;
  }

  private resolveImageUrl(imageUrl: string): string {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${this.baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}

// Export singleton instance
export const seoManager = new SEOManager();

// React hook for SEO
export const useSEO = (config: Partial<SEOConfig>) => {
  React.useEffect(() => {
    seoManager.updateHead(config);
  }, [config]);
};

// Page-specific SEO configs
export const pageConfigs = {
  home: {
    title: 'Real Estate Hotspot - Nigeria\'s Most Trusted Property Platform',
    description: 'Nigeria\'s premier real estate platform connecting buyers, sellers, agents, and service providers. Find verified properties, trusted agents, and professional services with secure transactions and escrow protection.',
    keywords: ['Nigeria real estate', 'property for sale', 'property for rent', 'Lagos properties', 'Abuja properties', 'real estate agents', 'property investment', 'verified listings', 'secure transactions']
  },
  
  properties: {
    title: 'Properties for Sale & Rent in Nigeria | Real Estate Hotspot',
    description: 'Browse thousands of verified properties for sale and rent across Nigeria. Find your perfect home, office, or investment property with trusted agents and secure transactions.',
    keywords: ['properties Nigeria', 'houses for sale', 'apartments for rent', 'Lagos properties', 'Abuja real estate', 'property listings']
  },

  agents: {
    title: 'Verified Real Estate Agents in Nigeria | Real Estate Hotspot', 
    description: 'Connect with verified, professional real estate agents across Nigeria. Find experienced agents in Lagos, Abuja, and other major cities for buying, selling, or renting properties.',
    keywords: ['real estate agents Nigeria', 'property agents Lagos', 'verified agents', 'real estate professionals', 'property consultants']
  },

  services: {
    title: 'Real Estate Services - Lawyers, Surveyors, Engineers | Real Estate Hotspot',
    description: 'Access professional real estate services including lawyers, surveyors, engineers, architects, and property consultants. Verified professionals for all your property needs.',
    keywords: ['real estate services', 'property lawyers', 'land surveyors', 'property engineers', 'real estate consultants', 'property services Nigeria']
  },

  mortgage: {
    title: 'Mortgage Calculator & Home Loans in Nigeria | Real Estate Hotspot',
    description: 'Calculate mortgage payments, compare home loan options, and find the best mortgage deals in Nigeria. Free mortgage calculator and expert advice.',
    keywords: ['mortgage calculator Nigeria', 'home loans', 'property financing', 'mortgage rates', 'home loan calculator', 'property loans Nigeria']
  },

  help: {
    title: 'Help & Support | Real Estate Hotspot',
    description: 'Get help with buying, selling, or renting properties. Access our knowledge base, live chat support, and expert guidance for all your real estate needs.',
    keywords: ['real estate help', 'property support', 'buying guide', 'selling guide', 'rental guide', 'property advice Nigeria']
  },

  advertise: {
    title: 'Advertise Your Property | Real Estate Hotspot',
    description: 'List your property for sale or rent on Nigeria\'s most trusted real estate platform. Reach thousands of verified buyers and tenants with our advertising packages.',
    keywords: ['advertise property', 'list property Nigeria', 'sell property online', 'rent property online', 'property marketing', 'real estate advertising']
  }
};

import React from 'react';

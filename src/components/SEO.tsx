import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { seoManager, SEOConfig } from '@/lib/seo';

interface SEOProps {
  title?: string;
  description?: string;
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
  children?: React.ReactNode;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
  twitterCard,
  canonical,
  noindex,
  nofollow,
  structuredData,
  children
}) => {
  const location = useLocation();

  useEffect(() => {
    const config: Partial<SEOConfig> = {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogType,
      twitterCard,
      canonical: canonical || `${import.meta.env.VITE_APP_URL || 'https://realestatehotspot.com'}${location.pathname}`,
      noindex,
      nofollow,
      structuredData
    };

    // Filter out undefined values
    const filteredConfig = Object.fromEntries(
      Object.entries(config).filter(([_, value]) => value !== undefined)
    );

    seoManager.updateHead(filteredConfig);
  }, [
    title,
    description,
    keywords,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    canonical,
    noindex,
    nofollow,
    structuredData,
    location.pathname
  ]);

  return <>{children}</>;
};

export default SEO;

// Hook for easier SEO management
export const useSEO = (config: Partial<SEOConfig>) => {
  const location = useLocation();

  useEffect(() => {
    const finalConfig = {
      ...config,
      canonical: config.canonical || `${import.meta.env.VITE_APP_URL || 'https://realestatehotspot.com'}${location.pathname}`
    };

    // Filter out undefined values
    const filteredConfig = Object.fromEntries(
      Object.entries(finalConfig).filter(([_, value]) => value !== undefined)
    );

    seoManager.updateHead(filteredConfig);
  }, [config, location.pathname]);
};

// Specialized SEO components for common use cases
export const PropertySEO: React.FC<{
  property: {
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
  };
  children?: React.ReactNode;
}> = ({ property, children }) => {
  const seoConfig = seoManager.generatePropertySEO(property);
  
  return (
    <SEO {...seoConfig}>
      {children}
    </SEO>
  );
};

export const AgentSEO: React.FC<{
  agent: {
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
  };
  children?: React.ReactNode;
}> = ({ agent, children }) => {
  const seoConfig = seoManager.generateAgentSEO(agent);
  
  return (
    <SEO {...seoConfig}>
      {children}
    </SEO>
  );
};

export const SearchSEO: React.FC<{
  query: string;
  location?: string;
  filters?: any;
  children?: React.ReactNode;
}> = ({ query, location, filters, children }) => {
  const seoConfig = seoManager.generateSearchSEO(query, location, filters);
  
  return (
    <SEO {...seoConfig}>
      {children}
    </SEO>
  );
};

// Breadcrumb component with SEO
export const BreadcrumbSEO: React.FC<{
  breadcrumbs: Array<{ name: string; url: string }>;
}> = ({ breadcrumbs }) => {
  useEffect(() => {
    const structuredData = seoManager.generateBreadcrumbStructuredData(breadcrumbs);
    
    // Add breadcrumb structured data
    const existingBreadcrumb = document.querySelector('script[data-breadcrumb="true"]');
    if (existingBreadcrumb) {
      existingBreadcrumb.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, [breadcrumbs]);

  return null;
};

// Organization structured data (should be included once globally)
export const OrganizationSEO: React.FC = () => {
  useEffect(() => {
    const structuredData = seoManager.generateOrganizationStructuredData();
    
    // Add organization structured data
    const existingOrg = document.querySelector('script[data-organization="true"]');
    if (existingOrg) {
      existingOrg.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-organization', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }, []);

  return null;
};

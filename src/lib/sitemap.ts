// Sitemap generation utilities for Real Estate Hotspot

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  staticUrls: SitemapUrl[];
  dynamicUrls?: {
    properties?: Array<{ id: string; lastmod?: string }>;
    agents?: Array<{ id: string; lastmod?: string }>;
    locations?: Array<{ slug: string; lastmod?: string }>;
  };
}

class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || import.meta.env.VITE_APP_URL || 'https://realestatehotspot.com';
  }

  /**
   * Generate complete sitemap XML
   */
  generateSitemap(config: SitemapConfig): string {
    const urls: SitemapUrl[] = [
      ...this.getStaticUrls(),
      ...config.staticUrls,
      ...(config.dynamicUrls?.properties?.map(p => this.createPropertyUrl(p)) || []),
      ...(config.dynamicUrls?.agents?.map(a => this.createAgentUrl(a)) || []),
      ...(config.dynamicUrls?.locations?.map(l => this.createLocationUrl(l)) || [])
    ];

    return this.createSitemapXML(urls);
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1`;
  }

  /**
   * Generate static URLs for the site
   */
  private getStaticUrls(): SitemapUrl[] {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return [
      {
        loc: this.baseUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${this.baseUrl}/properties`,
        lastmod: currentDate,
        changefreq: 'hourly',
        priority: 0.9
      },
      {
        loc: `${this.baseUrl}/agents`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/services`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/mortgage`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.6
      },
      {
        loc: `${this.baseUrl}/advertise`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/help`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/about`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: `${this.baseUrl}/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.5
      },
      // Property type pages
      {
        loc: `${this.baseUrl}/properties?type=apartment`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/properties?type=house`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/properties?type=commercial`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.7
      },
      {
        loc: `${this.baseUrl}/properties?type=land`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.7
      },
      // Location pages
      {
        loc: `${this.baseUrl}/properties?location=Lagos`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/properties?location=Abuja`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: `${this.baseUrl}/properties?location=Port-Harcourt`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: 0.7
      }
    ];
  }

  /**
   * Create property URL entry
   */
  private createPropertyUrl(property: { id: string; lastmod?: string }): SitemapUrl {
    return {
      loc: `${this.baseUrl}/properties/${property.id}`,
      lastmod: property.lastmod || new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.8
    };
  }

  /**
   * Create agent URL entry
   */
  private createAgentUrl(agent: { id: string; lastmod?: string }): SitemapUrl {
    return {
      loc: `${this.baseUrl}/agents/${agent.id}`,
      lastmod: agent.lastmod || new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: 0.7
    };
  }

  /**
   * Create location URL entry
   */
  private createLocationUrl(location: { slug: string; lastmod?: string }): SitemapUrl {
    return {
      loc: `${this.baseUrl}/location/${location.slug}`,
      lastmod: location.lastmod || new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.6
    };
  }

  /**
   * Create sitemap XML
   */
  private createSitemapXML(urls: SitemapUrl[]): string {
    const urlEntries = urls.map(url => {
      let entry = `  <url>\n    <loc>${url.loc}</loc>`;
      
      if (url.lastmod) {
        entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      }
      
      if (url.changefreq) {
        entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      }
      
      if (url.priority !== undefined) {
        entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      }
      
      entry += '\n  </url>';
      return entry;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
  }
}

// Export singleton instance
export const sitemapGenerator = new SitemapGenerator();

// Function to generate and download sitemap
export const downloadSitemap = async (properties: any[], agents: any[]) => {
  const config: SitemapConfig = {
    baseUrl: import.meta.env.VITE_APP_URL || 'https://realestatehotspot.com',
    staticUrls: [],
    dynamicUrls: {
      properties: properties.map(p => ({ 
        id: p.id, 
        lastmod: p.updatedAt || p.createdAt 
      })),
      agents: agents.map(a => ({ 
        id: a.id, 
        lastmod: a.updatedAt || a.createdAt 
      }))
    }
  };

  const sitemapXML = sitemapGenerator.generateSitemap(config);
  const robotsTxt = sitemapGenerator.generateRobotsTxt();

  // Download sitemap
  const sitemapBlob = new Blob([sitemapXML], { type: 'application/xml' });
  const sitemapUrl = URL.createObjectURL(sitemapBlob);
  const sitemapLink = document.createElement('a');
  sitemapLink.href = sitemapUrl;
  sitemapLink.download = 'sitemap.xml';
  sitemapLink.click();

  // Download robots.txt
  const robotsBlob = new Blob([robotsTxt], { type: 'text/plain' });
  const robotsUrl = URL.createObjectURL(robotsBlob);
  const robotsLink = document.createElement('a');
  robotsLink.href = robotsUrl;
  robotsLink.download = 'robots.txt';
  robotsLink.click();

  URL.revokeObjectURL(sitemapUrl);
  URL.revokeObjectURL(robotsUrl);
};

// SEO audit utilities
export interface SEOAuditResult {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
  }>;
  recommendations: string[];
}

export const auditPageSEO = (): SEOAuditResult => {
  const issues: SEOAuditResult['issues'] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check title
  const title = document.title;
  if (!title) {
    issues.push({ type: 'error', message: 'Missing page title', element: 'title' });
    score -= 20;
  } else if (title.length < 30 || title.length > 60) {
    issues.push({ 
      type: 'warning', 
      message: `Title length (${title.length}) should be between 30-60 characters`,
      element: 'title'
    });
    score -= 5;
  }

  // Check meta description
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!description) {
    issues.push({ type: 'error', message: 'Missing meta description' });
    score -= 15;
  } else if (description.length < 120 || description.length > 160) {
    issues.push({ 
      type: 'warning', 
      message: `Meta description length (${description.length}) should be between 120-160 characters`
    });
    score -= 5;
  }

  // Check Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogImage = document.querySelector('meta[property="og:image"]');

  if (!ogTitle || !ogDescription || !ogImage) {
    issues.push({ type: 'warning', message: 'Missing Open Graph tags for social sharing' });
    score -= 10;
  }

  // Check structured data
  const structuredData = document.querySelector('script[type="application/ld+json"]');
  if (!structuredData) {
    issues.push({ type: 'info', message: 'No structured data found' });
    score -= 5;
  }

  // Check images alt text
  const images = document.querySelectorAll('img');
  let imagesWithoutAlt = 0;
  images.forEach(img => {
    if (!img.alt) {
      imagesWithoutAlt++;
    }
  });

  if (imagesWithoutAlt > 0) {
    issues.push({ 
      type: 'warning', 
      message: `${imagesWithoutAlt} images missing alt text` 
    });
    score -= Math.min(10, imagesWithoutAlt * 2);
  }

  // Check headings structure
  const h1s = document.querySelectorAll('h1');
  if (h1s.length === 0) {
    issues.push({ type: 'error', message: 'No H1 heading found' });
    score -= 15;
  } else if (h1s.length > 1) {
    issues.push({ type: 'warning', message: 'Multiple H1 headings found' });
    score -= 5;
  }

  // Generate recommendations
  if (score < 90) {
    recommendations.push('Optimize page title and meta description');
  }
  if (!structuredData) {
    recommendations.push('Add structured data markup for better search visibility');
  }
  if (imagesWithoutAlt > 0) {
    recommendations.push('Add descriptive alt text to all images');
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations
  };
};

export default SitemapGenerator;

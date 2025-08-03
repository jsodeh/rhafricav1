import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  BookOpen,
  User,
  Home,
  CreditCard,
  Shield,
  Settings,
  Star,
  Clock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Download,
  Play,
  FileText,
  Video,
  HelpCircle,
  ChevronRight,
  ArrowLeft,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  dislikes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_read_time: number;
  related_articles: string[];
  attachments?: KnowledgeBaseAttachment[];
}

export interface KnowledgeBaseAttachment {
  id: string;
  type: "document" | "video" | "image";
  title: string;
  url: string;
  size?: number;
  duration?: number;
}

export interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  article_count: number;
  subcategories?: string[];
}

interface KnowledgeBaseProps {
  className?: string;
}

const categories: KnowledgeBaseCategory[] = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Basic guides to help you get started with our platform",
    icon: BookOpen,
    article_count: 12,
    subcategories: ["Account Setup", "First Steps", "Basic Features"],
  },
  {
    id: "property-management",
    name: "Property Management",
    description: "How to list, manage, and sell your properties",
    icon: Home,
    article_count: 18,
    subcategories: ["Listing Properties", "Property Photos", "Pricing Strategy"],
  },
  {
    id: "buying-selling",
    name: "Buying & Selling",
    description: "Complete guide to buying and selling real estate",
    icon: CreditCard,
    article_count: 15,
    subcategories: ["Search Tips", "Making Offers", "Closing Process"],
  },
  {
    id: "agent-tools",
    name: "Agent Tools",
    description: "Tools and features for real estate professionals",
    icon: User,
    article_count: 22,
    subcategories: ["Dashboard", "Client Management", "Marketing Tools"],
  },
  {
    id: "security-safety",
    name: "Security & Safety",
    description: "Staying safe and secure on our platform",
    icon: Shield,
    article_count: 8,
    subcategories: ["Account Security", "Safe Transactions", "Fraud Prevention"],
  },
  {
    id: "account-settings",
    name: "Account & Settings",
    description: "Manage your account and customize your experience",
    icon: Settings,
    article_count: 10,
    subcategories: ["Profile Settings", "Notifications", "Privacy"],
  },
];

const mockArticles: KnowledgeBaseArticle[] = [
  {
    id: "1",
    title: "How to Create Your First Property Listing",
    content: `Creating your first property listing on Real Estate Hotspot is straightforward and designed to help you showcase your property effectively.

## Step 1: Access the Listing Creation Tool
Navigate to your dashboard and click on the "Add Property" button. This will take you to our comprehensive listing creation wizard.

## Step 2: Property Details
Fill in the basic information about your property:
- Property type (House, Apartment, Commercial, etc.)
- Number of bedrooms and bathrooms
- Square footage
- Lot size
- Year built

## Step 3: Location Information
Provide accurate location details:
- Full address
- Neighborhood information
- Nearby amenities
- Transportation links

## Step 4: Upload High-Quality Photos
Photos are crucial for attracting buyers:
- Use natural lighting when possible
- Take photos from multiple angles
- Include exterior and interior shots
- Show unique features and amenities

## Step 5: Write Compelling Descriptions
Your description should:
- Highlight unique features
- Mention recent upgrades
- Describe the neighborhood
- Include nearby schools and amenities

## Step 6: Set Competitive Pricing
Research comparable properties in your area and set a competitive price. Our platform provides market insights to help you price appropriately.

## Step 7: Review and Publish
Before publishing, review all information for accuracy. Once published, your listing will be visible to thousands of potential buyers.`,
    excerpt: "Learn how to create an effective property listing that attracts buyers and showcases your property's best features.",
    category: "property-management",
    tags: ["listing", "beginner", "property", "photos"],
    author: "Real Estate Team",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
    views: 1247,
    likes: 89,
    dislikes: 3,
    difficulty: "beginner",
    estimated_read_time: 5,
    related_articles: ["2", "3", "4"],
    attachments: [
      {
        id: "att_1",
        type: "video",
        title: "Property Photo Tutorial",
        url: "#",
        duration: 180,
      },
      {
        id: "att_2",
        type: "document",
        title: "Listing Checklist PDF",
        url: "#",
        size: 245000,
      },
    ],
  },
  {
    id: "2",
    title: "Photography Tips for Property Listings",
    content: `Great photos can make or break your property listing. Here's how to take professional-quality photos that sell your property.

## Equipment Needed
- DSLR camera or high-quality smartphone
- Tripod for stability
- Wide-angle lens (if available)
- External lighting or flash

## Lighting Tips
- Shoot during golden hour (1 hour after sunrise or before sunset)
- Open all curtains and blinds
- Turn on all lights in the room
- Use HDR mode for challenging lighting

## Composition Guidelines
- Keep the camera level
- Use the rule of thirds
- Show the flow between rooms
- Include context shots of the neighborhood

## Room-by-Room Guide
Each room requires a different approach to showcase its best features effectively.`,
    excerpt: "Professional photography tips to make your property listings stand out and attract more potential buyers.",
    category: "property-management",
    tags: ["photography", "listing", "tips", "marketing"],
    author: "Photography Expert",
    created_at: "2024-01-10T15:00:00Z",
    updated_at: "2024-01-15T09:00:00Z",
    views: 892,
    likes: 67,
    dislikes: 2,
    difficulty: "intermediate",
    estimated_read_time: 7,
    related_articles: ["1", "3"],
  },
  {
    id: "3",
    title: "Understanding the Escrow Process",
    content: `The escrow process protects both buyers and sellers during real estate transactions. Here's everything you need to know.

## What is Escrow?
Escrow is a financial arrangement where a neutral third party holds funds during a transaction until all conditions are met.

## How Our Escrow Service Works
1. Buyer deposits funds into escrow
2. Seller transfers property ownership
3. All conditions and inspections are completed
4. Funds are released to the seller

## Benefits of Using Escrow
- Protection for both parties
- Secure fund handling
- Dispute resolution
- Compliance with legal requirements

## Timeline and Process
The typical escrow process takes 30-45 days and involves several key milestones.`,
    excerpt: "Comprehensive guide to understanding how escrow protects your real estate transactions.",
    category: "security-safety",
    tags: ["escrow", "security", "transactions", "buying"],
    author: "Legal Team",
    created_at: "2024-01-08T11:00:00Z",
    updated_at: "2024-01-12T16:00:00Z",
    views: 1456,
    likes: 112,
    dislikes: 8,
    difficulty: "intermediate",
    estimated_read_time: 8,
    related_articles: ["4", "5"],
  },
];

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ className = "" }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBaseArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [articles, setArticles] = useState<KnowledgeBaseArticle[]>(mockArticles);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle article rating
  const handleRating = (articleId: string, isLike: boolean) => {
    setArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        return {
          ...article,
          likes: isLike ? article.likes + 1 : article.likes,
          dislikes: !isLike ? article.dislikes + 1 : article.dislikes,
        };
      }
      return article;
    }));
  };

  // Handle bookmark
  const handleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Format read time
  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  // Render article view
  if (selectedArticle) {
    return (
      <div className={cn("h-[600px] flex flex-col", className)}>
        {/* Article Header */}
        <div className="p-6 border-b bg-white">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                  {selectedArticle.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">
                  {formatReadTime(selectedArticle.estimated_read_time)}
                </span>
                <span className="text-sm text-gray-500">•</span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-3 w-3" />
                  {selectedArticle.views} views
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedArticle.title}
              </h1>
              
              <p className="text-gray-600 mb-4">{selectedArticle.excerpt}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {selectedArticle.author}</span>
                <span>•</span>
                <span>Updated {new Date(selectedArticle.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBookmark(selectedArticle.id)}
            >
              <Bookmark 
                className={cn(
                  "h-4 w-4 mr-1",
                  bookmarkedArticles.includes(selectedArticle.id) ? "fill-current" : ""
                )} 
              />
              {bookmarkedArticles.includes(selectedArticle.id) ? "Bookmarked" : "Bookmark"}
            </Button>
          </div>
        </div>

        {/* Article Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-gray max-w-none">
              {selectedArticle.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-xl font-semibold text-gray-900 mt-8 mb-4">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                } else if (paragraph.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                      {paragraph.replace('# ', '')}
                    </h1>
                  );
                } else if (paragraph.trim() === '') {
                  return <br key={index} />;
                } else if (paragraph.startsWith('- ')) {
                  return (
                    <li key={index} className="text-gray-700 mb-1">
                      {paragraph.replace('- ', '')}
                    </li>
                  );
                } else {
                  return (
                    <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                }
              })}
            </div>

            {/* Attachments */}
            {selectedArticle.attachments && selectedArticle.attachments.length > 0 && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Additional Resources</h3>
                <div className="space-y-2">
                  {selectedArticle.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-3 p-3 bg-white rounded border">
                      {attachment.type === "video" && <Video className="h-5 w-5 text-blue-600" />}
                      {attachment.type === "document" && <FileText className="h-5 w-5 text-green-600" />}
                      {attachment.type === "image" && <FileText className="h-5 w-5 text-purple-600" />}
                      
                      <div className="flex-1">
                        <div className="font-medium">{attachment.title}</div>
                        <div className="text-sm text-gray-500">
                          {attachment.duration && `${attachment.duration}s`}
                          {attachment.size && `${(attachment.size / 1024).toFixed(1)} KB`}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        {attachment.type === "video" ? <Play className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Rating */}
            <div className="mt-8 p-4 border-t">
              <div className="text-center">
                <p className="text-lg font-medium mb-4">Was this article helpful?</p>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleRating(selectedArticle.id, true)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes ({selectedArticle.likes})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRating(selectedArticle.id, false)}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No ({selectedArticle.dislikes})
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {selectedArticle.related_articles.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                <div className="space-y-2">
                  {selectedArticle.related_articles.map((relatedId) => {
                    const relatedArticle = articles.find(a => a.id === relatedId);
                    if (!relatedArticle) return null;
                    
                    return (
                      <div
                        key={relatedId}
                        className="flex items-center gap-3 p-3 bg-white rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => setSelectedArticle(relatedArticle)}
                      >
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">{relatedArticle.title}</div>
                          <div className="text-sm text-gray-500">{relatedArticle.excerpt}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Render main knowledge base view
  return (
    <div className={cn("h-[600px] flex flex-col", className)}>
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Knowledge Base</h2>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="browse" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="h-full">
            {selectedCategory ? (
              /* Articles List */
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Categories
                  </Button>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold line-clamp-2 flex-1">
                            {article.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookmark(article.id);
                            }}
                            className="ml-2"
                          >
                            <Bookmark 
                              className={cn(
                                "h-4 w-4",
                                bookmarkedArticles.includes(article.id) ? "fill-current" : ""
                              )} 
                            />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(article.difficulty)}>
                              {article.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatReadTime(article.estimated_read_time)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Eye className="h-3 w-3" />
                            {article.views}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              /* Categories Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <category.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-500">
                            {category.article_count} articles
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {category.description}
                      </p>
                      
                      {category.subcategories && (
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <Badge key={sub} variant="secondary" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles
                .sort((a, b) => b.views - a.views)
                .slice(0, 6)
                .map((article) => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">Popular</span>
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.likes}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 6)
                .map((article) => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Recently Updated</span>
                      </div>
                      
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      
                      <div className="text-xs text-gray-500">
                        Updated {new Date(article.updated_at).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KnowledgeBase;

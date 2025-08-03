export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_reviews: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          property_id: string | null
          rating: number | null
          review_text: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_reviews_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "real_estate_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      case_submissions: {
        Row: {
          case_type: string
          created_at: string | null
          description: string
          documents: Json | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string | null
          urgency: string
        }
        Insert: {
          case_type: string
          created_at?: string | null
          description: string
          documents?: Json | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          urgency: string
        }
        Update: {
          case_type?: string
          created_at?: string | null
          description?: string
          documents?: Json | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          urgency?: string
        }
        Relationships: []
      }
      movement_members: {
        Row: {
          created_at: string | null
          email: string
          how_help: string | null
          id: string
          interests: string[] | null
          name: string
          phone: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          how_help?: string | null
          id?: string
          interests?: string[] | null
          name: string
          phone?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          how_help?: string | null
          id?: string
          interests?: string[] | null
          name?: string
          phone?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          category: "property" | "booking" | "payment" | "message" | "system"
          read: boolean
          action_url: string | null
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          category: "property" | "booking" | "payment" | "message" | "system"
          read?: boolean
          action_url?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          category?: "property" | "booking" | "payment" | "message" | "system"
          read?: boolean
          action_url?: string | null
          created_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          agent_id: string | null
          amenities: string[] | null
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          city: string
          country: string | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          furnishing_status: string | null
          id: string
          images: string[] | null
          latitude: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude: number | null
          parking_spaces: number | null
          price: number
          property_documents: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          state: string
          status: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at: string | null
          verified: boolean | null
          views_count: number | null
          virtual_tour_url: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          agent_id?: string | null
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          furnishing_status?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          parking_spaces?: number | null
          price: number
          property_documents?: Json | null
          property_type: Database["public"]["Enums"]["property_type"]
          state: string
          status?: Database["public"]["Enums"]["property_status"] | null
          title: string
          updated_at?: string | null
          verified?: boolean | null
          views_count?: number | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          agent_id?: string | null
          amenities?: string[] | null
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string
          country?: string | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          furnishing_status?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          parking_spaces?: number | null
          price?: number
          property_documents?: Json | null
          property_type?: Database["public"]["Enums"]["property_type"]
          state?: string
          status?: Database["public"]["Enums"]["property_status"] | null
          title?: string
          updated_at?: string | null
          verified?: boolean | null
          views_count?: number | null
          virtual_tour_url?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "real_estate_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      property_favorites: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_inquiries: {
        Row: {
          agent_id: string | null
          created_at: string | null
          email: string | null
          id: string
          message: string
          phone: string | null
          preferred_contact_method: string | null
          property_id: string | null
          response: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message: string
          phone?: string | null
          preferred_contact_method?: string | null
          property_id?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string
          phone?: string | null
          preferred_contact_method?: string | null
          property_id?: string | null
          response?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "real_estate_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_reviews: {
        Row: {
          created_at: string | null
          id: string
          property_id: string | null
          rating: number | null
          review_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string | null
          rating?: number | null
          review_text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_viewings: {
        Row: {
          agent_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          property_id: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          property_id?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_viewings_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "real_estate_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_viewings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_agents: {
        Row: {
          agency_name: string | null
          bio: string | null
          created_at: string | null
          id: string
          license_number: string | null
          phone: string | null
          profile_image_url: string | null
          rating: number | null
          specializations: string[] | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience: number | null
        }
        Insert: {
          agency_name?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience?: number | null
        }
        Update: {
          agency_name?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          license_number?: string | null
          phone?: string | null
          profile_image_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          years_experience?: number | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          results_count: number | null
          search_query: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      site_content: {
        Row: {
          created_at: string | null
          id: string
          key: string
          section: string
          type: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          section: string
          type?: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          section?: string
          type?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          anonymous: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          status: string | null
          story: string
        }
        Insert: {
          anonymous?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          status?: string | null
          story: string
        }
        Update: {
          anonymous?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string | null
          story?: string
        }
        Relationships: []
      }
      video_links: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      listing_type: "sale" | "rent"
      property_status:
        | "for_sale"
        | "for_rent"
        | "sold"
        | "rented"
        | "off_market"
      property_type:
        | "apartment"
        | "house"
        | "duplex"
        | "penthouse"
        | "land"
        | "commercial"
        | "office"
      notification_category:
        | "property"
        | "booking"
        | "payment"
        | "message"
        | "system"
      notification_type: "info" | "success" | "warning" | "error"
      user_role: "admin" | "user"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      listing_type: ["sale", "rent"],
      property_status: ["for_sale", "for_rent", "sold", "rented", "off_market"],
      property_type: [
        "apartment",
        "house",
        "duplex",
        "penthouse",
        "land",
        "commercial",
        "office",
      ],
      user_role: ["admin", "user"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const

/**
 * Supabase Database types (manually authored from migrations 00001-00010).
 *
 * These mirror the output of `pnpm supabase:types` (which requires a running
 * Supabase local stack). When local Supabase becomes available, re-run that
 * command to regenerate this file — the manual types here are structurally
 * compatible and will be replaced byte-for-byte.
 *
 * Tables: profiles, ingredients, pre_designed_cakes, orders,
 *         order_status_history, bakery_settings, favorites
 */

/* ──────────────────────────────────────────────────────────── */
/*  Supabase JSON helper                                       */
/* ──────────────────────────────────────────────────────────── */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* ──────────────────────────────────────────────────────────── */
/*  Database                                                   */
/* ──────────────────────────────────────────────────────────── */

export type Database = {
  public: {
    Tables: {
      /* ── profiles ─────────────────────────────────────── */
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          role: string | null;
          is_guest: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string | null;
          is_guest?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          role?: string | null;
          is_guest?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      /* ── ingredients ───────────────────────────────────── */
      ingredients: {
        Row: {
          id: string;
          type: string;
          name: string;
          description: string | null;
          image_url: string;
          additional_price: number | null;
          is_available: boolean | null;
          is_active: boolean | null;
          sort_order: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          name: string;
          description?: string | null;
          image_url: string;
          additional_price?: number | null;
          is_available?: boolean | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string;
          description?: string | null;
          image_url?: string;
          additional_price?: number | null;
          is_available?: boolean | null;
          is_active?: boolean | null;
          sort_order?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };

      /* ── pre_designed_cakes ───────────────────────────── */
      pre_designed_cakes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          ingredients: string[] | null;
          size: string;
          price: number;
          estimated_time: number | null;
          image_url: string;
          category: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          ingredients?: string[] | null;
          size: string;
          price: number;
          estimated_time?: number | null;
          image_url: string;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          ingredients?: string[] | null;
          size?: string;
          price?: number;
          estimated_time?: number | null;
          image_url?: string;
          category?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      /* ── orders ───────────────────────────────────────── */
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_type: string;
          pre_designed_cake_id: string | null;
          size_choice: string | null;
          pan_choice: string | null;
          relleno_choice: string | null;
          cobertura_choice: string | null;
          reference_image_url: string | null;
          description: string | null;
          total_price: number;
          status: string;
          required_date: string | null;
          delivery_type: string | null;
          delivery_time: string | null;
          delivery_address: string | null;
          notes: string | null;
          whatsapp_message: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_type: string;
          pre_designed_cake_id?: string | null;
          size_choice?: string | null;
          pan_choice?: string | null;
          relleno_choice?: string | null;
          cobertura_choice?: string | null;
          reference_image_url?: string | null;
          description?: string | null;
          total_price: number;
          status?: string;
          required_date?: string | null;
          delivery_type?: string | null;
          delivery_time?: string | null;
          delivery_address?: string | null;
          notes?: string | null;
          whatsapp_message?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_type?: string;
          pre_designed_cake_id?: string | null;
          size_choice?: string | null;
          pan_choice?: string | null;
          relleno_choice?: string | null;
          cobertura_choice?: string | null;
          reference_image_url?: string | null;
          description?: string | null;
          total_price?: number;
          status?: string;
          required_date?: string | null;
          delivery_type?: string | null;
          delivery_time?: string | null;
          delivery_address?: string | null;
          notes?: string | null;
          whatsapp_message?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_pre_designed_cake_id_fkey';
            columns: ['pre_designed_cake_id'];
            referencedRelation: 'pre_designed_cakes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_pan_choice_fkey';
            columns: ['pan_choice'];
            referencedRelation: 'ingredients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_relleno_choice_fkey';
            columns: ['relleno_choice'];
            referencedRelation: 'ingredients';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_cobertura_choice_fkey';
            columns: ['cobertura_choice'];
            referencedRelation: 'ingredients';
            referencedColumns: ['id'];
          },
        ];
      };

      /* ── order_status_history ─────────────────────────── */
      order_status_history: {
        Row: {
          id: string;
          order_id: string | null;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          status: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_status_history_order_id_fkey';
            columns: ['order_id'];
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_status_history_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      /* ── bakery_settings ──────────────────────────────── */
      bakery_settings: {
        Row: {
          id: string;
          whatsapp_number: string;
          business_hours: Json | null;
          theme: string | null;
          social_links: Json | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          whatsapp_number: string;
          business_hours?: Json | null;
          theme?: string | null;
          social_links?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          whatsapp_number?: string;
          business_hours?: Json | null;
          theme?: string | null;
          social_links?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };

      /* ── favorites ─────────────────────────────────────── */
      favorites: {
        Row: {
          id: string;
          user_id: string | null;
          pre_designed_cake_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          pre_designed_cake_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          pre_designed_cake_id?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_pre_designed_cake_id_fkey';
            columns: ['pre_designed_cake_id'];
            referencedRelation: 'pre_designed_cakes';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    'Composite Types': Record<string, never>;
  };
};

/* ──────────────────────────────────────────────────────────── */
/*  Convenience helpers (match generated output)               */
/* ──────────────────────────────────────────────────────────── */

export type Tables<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Row'];

export type TablesInsert<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<
  T extends keyof Database['public']['Tables'],
> = Database['public']['Tables'][T]['Update'];

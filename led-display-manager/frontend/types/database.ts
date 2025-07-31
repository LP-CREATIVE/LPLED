export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      displays: {
        Row: {
          id: string
          user_id: string
          display_name: string
          vnnox_terminal_id: string
          vnnox_secret: string
          location: string | null
          status: 'online' | 'offline' | 'error'
          last_seen: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          vnnox_terminal_id: string
          vnnox_secret: string
          location?: string | null
          status?: 'online' | 'offline' | 'error'
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          vnnox_terminal_id?: string
          vnnox_secret?: string
          location?: string | null
          status?: 'online' | 'offline' | 'error'
          last_seen?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          width: number | null
          height: number | null
          duration: number | null
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          width?: number | null
          height?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          width?: number | null
          height?: number | null
          duration?: number | null
          thumbnail_url?: string | null
          created_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          preview_url: string
          template_data: Json
          is_public: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          preview_url: string
          template_data: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          preview_url?: string
          template_data?: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
        }
      }
      content_schedules: {
        Row: {
          id: string
          display_id: string
          content_type: 'media' | 'template'
          content_id: string
          start_time: string
          end_time: string | null
          repeat_days: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          display_id: string
          content_type: 'media' | 'template'
          content_id: string
          start_time: string
          end_time?: string | null
          repeat_days?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_id?: string
          content_type?: 'media' | 'template'
          content_id?: string
          start_time?: string
          end_time?: string | null
          repeat_days?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
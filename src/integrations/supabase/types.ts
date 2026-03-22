export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      alarms: {
        Row: {
          alarm_time: string
          alarm_type: string
          created_at: string
          custom_sound_url: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          max_snoozes: number | null
          original_alarm_time: string | null
          recurrence_days: number[] | null
          recurrence_pattern: string | null
          snooze_count: number | null
          snooze_duration_minutes: number | null
          sound_type: string | null
          task_schedule_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          alarm_time: string
          alarm_type?: string
          created_at?: string
          custom_sound_url?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          max_snoozes?: number | null
          original_alarm_time?: string | null
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          snooze_count?: number | null
          snooze_duration_minutes?: number | null
          sound_type?: string | null
          task_schedule_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          alarm_time?: string
          alarm_type?: string
          created_at?: string
          custom_sound_url?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          max_snoozes?: number | null
          original_alarm_time?: string | null
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          snooze_count?: number | null
          snooze_duration_minutes?: number | null
          sound_type?: string | null
          task_schedule_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alarms_task_schedule_id_fkey"
            columns: ["task_schedule_id"]
            isOneToOne: false
            referencedRelation: "task_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          created_at: string
          id: string
          logged_at: string
          mood: string
          mood_zone: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          logged_at?: string
          mood: string
          mood_zone: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          logged_at?: string
          mood?: string
          mood_zone?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          folder: string | null
          id: string
          is_archived: boolean | null
          is_starred: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          folder?: string | null
          id?: string
          is_archived?: boolean | null
          is_starred?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_hour_limit: number | null
          email: string
          first_name: string
          id: string
          last_name: string
          nickname: string | null
          nudge_enabled: boolean | null
          nudge_frequency: string | null
          onboarding_completed: boolean | null
          theme_color: string | null
          theme_intensity: number | null
          theme_mode: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_hour_limit?: number | null
          email: string
          first_name?: string
          id: string
          last_name?: string
          nickname?: string | null
          nudge_enabled?: boolean | null
          nudge_frequency?: string | null
          onboarding_completed?: boolean | null
          theme_color?: string | null
          theme_intensity?: number | null
          theme_mode?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_hour_limit?: number | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          nickname?: string | null
          nudge_enabled?: boolean | null
          nudge_frequency?: string | null
          onboarding_completed?: boolean | null
          theme_color?: string | null
          theme_intensity?: number | null
          theme_mode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quick_tasks: {
        Row: {
          created_at: string
          created_date: string
          id: string
          is_done: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_date: string
          id?: string
          is_done?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_date?: string
          id?: string
          is_done?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_notes: {
        Row: {
          created_at: string
          id: string
          is_done: boolean | null
          linked_alarm_id: string | null
          notify_schedule: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_done?: boolean | null
          linked_alarm_id?: string | null
          notify_schedule?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_done?: boolean | null
          linked_alarm_id?: string | null
          notify_schedule?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_notes_linked_alarm_id_fkey"
            columns: ["linked_alarm_id"]
            isOneToOne: false
            referencedRelation: "alarms"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_completions: {
        Row: {
          completed_at: string
          completed_date: string
          id: string
          routine_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          completed_date: string
          id?: string
          routine_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          completed_date?: string
          id?: string
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_completions_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          created_at: string
          deadline_time: string | null
          description: string | null
          id: string
          is_active: boolean | null
          order_index: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deadline_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          deadline_time?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          order_index?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          created_at: string
          estimated_hours: number | null
          id: string
          is_completed: boolean
          order_index: number
          task_id: string
          title: string
        }
        Insert: {
          created_at?: string
          estimated_hours?: number | null
          id?: string
          is_completed?: boolean
          order_index?: number
          task_id: string
          title: string
        }
        Update: {
          created_at?: string
          estimated_hours?: number | null
          id?: string
          is_completed?: boolean
          order_index?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_schedules: {
        Row: {
          actual_hours_spent: number | null
          allocated_hours: number
          created_at: string
          display_title: string | null
          end_time: string | null
          id: string
          is_locked: boolean | null
          scheduled_date: string
          start_time: string | null
          status: string
          subtask_id: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          actual_hours_spent?: number | null
          allocated_hours?: number
          created_at?: string
          display_title?: string | null
          end_time?: string | null
          id?: string
          is_locked?: boolean | null
          scheduled_date: string
          start_time?: string | null
          status?: string
          subtask_id?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          actual_hours_spent?: number | null
          allocated_hours?: number
          created_at?: string
          display_title?: string | null
          end_time?: string | null
          id?: string
          is_locked?: boolean | null
          scheduled_date?: string
          start_time?: string | null
          status?: string
          subtask_id?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_schedules_subtask_id_fkey"
            columns: ["subtask_id"]
            isOneToOne: false
            referencedRelation: "subtasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_schedules_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string
          estimated_hours: number
          icon_color: string | null
          icon_emoji: string | null
          id: string
          is_recurring: boolean | null
          kind: string | null
          preferred_time: string | null
          priority: string
          recurrence_days: number[] | null
          recurrence_pattern: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date: string
          estimated_hours?: number
          icon_color?: string | null
          icon_emoji?: string | null
          id?: string
          is_recurring?: boolean | null
          kind?: string | null
          preferred_time?: string | null
          priority?: string
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string
          estimated_hours?: number
          icon_color?: string | null
          icon_emoji?: string | null
          id?: string
          is_recurring?: boolean | null
          kind?: string | null
          preferred_time?: string | null
          priority?: string
          recurrence_days?: number[] | null
          recurrence_pattern?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          created_at: string
          glasses_count: number
          id: string
          tracked_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          glasses_count?: number
          id?: string
          tracked_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          glasses_count?: number
          id?: string
          tracked_date?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_user_stats: {
        Args: never
        Returns: {
          avatar_url: string
          completed_tasks: number
          created_at: string
          display_name: string
          email: string
          first_name: string
          id: string
          last_activity: string
          last_name: string
          nickname: string
          onboarding_completed: boolean
          theme_mode: string
          total_alarms: number
          total_mood_entries: number
          total_notes: number
          total_tasks: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      seed_example_content_for_user: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const

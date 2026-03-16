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
      battle_answers: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_index: number
          room_id: string
          selected_answer: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          question_index: number
          room_id: string
          selected_answer: string
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_index?: number
          room_id?: string
          selected_answer?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "battle_answers_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "battle_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_rooms: {
        Row: {
          bet_amount: number
          created_at: string
          current_question: number
          finished_at: string | null
          guest_display_name: string | null
          guest_id: string | null
          guest_score: number
          host_display_name: string
          host_id: string
          host_score: number
          id: string
          invited_friend_id: string | null
          is_random_match: boolean
          question_ids: string[]
          questions_data: Json | null
          room_code: string
          started_at: string | null
          status: string
          subject_id: string
          topic_name: string
        }
        Insert: {
          bet_amount?: number
          created_at?: string
          current_question?: number
          finished_at?: string | null
          guest_display_name?: string | null
          guest_id?: string | null
          guest_score?: number
          host_display_name?: string
          host_id: string
          host_score?: number
          id?: string
          invited_friend_id?: string | null
          is_random_match?: boolean
          question_ids?: string[]
          questions_data?: Json | null
          room_code: string
          started_at?: string | null
          status?: string
          subject_id: string
          topic_name: string
        }
        Update: {
          bet_amount?: number
          created_at?: string
          current_question?: number
          finished_at?: string | null
          guest_display_name?: string | null
          guest_id?: string | null
          guest_score?: number
          host_display_name?: string
          host_id?: string
          host_score?: number
          id?: string
          invited_friend_id?: string | null
          is_random_match?: boolean
          question_ids?: string[]
          questions_data?: Json | null
          room_code?: string
          started_at?: string | null
          status?: string
          subject_id?: string
          topic_name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          display_name: string
          id: string
          message: string
          room_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id?: string
          message: string
          room_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          message?: string
          room_code?: string
          user_id?: string
        }
        Relationships: []
      }
      friend_requests: {
        Row: {
          created_at: string
          from_id: string
          id: string
          status: string
          to_id: string
        }
        Insert: {
          created_at?: string
          from_id: string
          id?: string
          status?: string
          to_id: string
        }
        Update: {
          created_at?: string
          from_id?: string
          id?: string
          status?: string
          to_id?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      missed_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          last_reviewed_at: string | null
          next_review_at: string
          question_text: string
          subject_id: string
          times_missed: number
          topic_name: string
          user_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string
          question_text: string
          subject_id: string
          times_missed?: number
          topic_name: string
          user_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          next_review_at?: string
          question_text?: string
          subject_id?: string
          times_missed?: number
          topic_name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          best_streak: number
          coins: number
          created_at: string
          display_name: string
          draws: number
          id: string
          last_daily_bonus: string | null
          losses: number
          total_correct: number
          total_questions: number
          total_quizzes: number
          updated_at: string
          user_id: string
          wins: number
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          best_streak?: number
          coins?: number
          created_at?: string
          display_name?: string
          draws?: number
          id?: string
          last_daily_bonus?: string | null
          losses?: number
          total_correct?: number
          total_questions?: number
          total_quizzes?: number
          updated_at?: string
          user_id: string
          wins?: number
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          best_streak?: number
          coins?: number
          created_at?: string
          display_name?: string
          draws?: number
          id?: string
          last_daily_bonus?: string | null
          losses?: number
          total_correct?: number
          total_questions?: number
          total_quizzes?: number
          updated_at?: string
          user_id?: string
          wins?: number
          xp?: number
        }
        Relationships: []
      }
      quiz_scores: {
        Row: {
          correct: number
          created_at: string
          id: string
          topic: string
          total: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          correct: number
          created_at?: string
          id?: string
          topic: string
          total: number
          user_id: string
          xp_earned: number
        }
        Update: {
          correct?: number
          created_at?: string
          id?: string
          topic?: string
          total?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

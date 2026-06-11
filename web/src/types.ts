/*
  types.ts — Shared type definitions for the entire app.
  Kept in one file because Survey, Question, and Response are referenced by
  every layer (API client, hooks, routes, components). 
*/

export interface Survey {
  id: string
  user_id: string
  title: string
  url_slug: string
  brand_color: string
  logo_url: string | null
  created_at: string
}

export interface Question {
  id: string
  survey_id: string
  question_type: 'short_text' | 'multiple_choice' | 'rating'
  question_text: string
  order_index: number
  is_required: boolean
  type_specific_options: Record<string, unknown> | null
  created_at: string
}

export interface Response {
  id: string
  survey_id: string
  answers: Record<string, unknown>
  submitted_at: string
}

export interface SurveyWithQuestions extends Survey {
  questions: Question[]
}

export type FormStatus =
  | "draft"
  | "published";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating";

export interface QuestionOption {
  id: number;
  label: string;
  order: number;
}

export interface Question {
  id: number;
  type: QuestionType;
  title: string;
  description: string | null;
  required: boolean;
  order: number;
  options: QuestionOption[];
}

export interface Form {
  id: number;
  title: string;
  status: FormStatus;
  public_id: string;
  response_count: number;
  created_at: string;
  updated_at: string;
  questions: Question[];
}
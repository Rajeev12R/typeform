import { apiFetch } from "./api";
import type { Question } from "@/app/types/form";

export type QuestionCreateData = {
  type: string;
  title: string;
  description?: string;
  required?: boolean;
  options?: { label: string }[];
};

export type QuestionUpdateData = {
  type?: string;
  title?: string;
  description?: string;
  required?: boolean;
  options?: { label: string }[];
};

export async function createQuestion(
  formId: number,
  data: QuestionCreateData,
): Promise<Question> {
  return apiFetch<Question>(`/api/forms/${formId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(
  questionId: number,
  data: QuestionUpdateData,
): Promise<Question> {
  return apiFetch<Question>(`/api/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(
  questionId: number,
): Promise<void> {
  return apiFetch<void>(`/api/questions/${questionId}`, {
    method: "DELETE",
  });
}

export async function reorderQuestions(
  formId: number,
  questionIds: number[],
): Promise<Question[]> {
  return apiFetch<Question[]>(`/api/forms/${formId}/questions/reorder`, {
    method: "PATCH",
    body: JSON.stringify({ question_ids: questionIds }),
  });
}

import { apiFetch } from "./api";

export type AnswerResponse = {
  id: number;
  question_id: number;
  value: string;
};

export type ResponseDetail = {
  id: number;
  form_id: number;
  submitted_at: string;
  answers: AnswerResponse[];
};

export type ResponseListItem = {
  id: number;
  submitted_at: string;
};

export type StatisticsItem = {
  question_id: number;
  question_title: string;
  question_type: string;
  total_answers: number;
  distribution: Record<string, number>;
};

export type FormStatistics = {
  form_id: number;
  total_responses: number;
  questions: StatisticsItem[];
};

export async function getResponses(formId: number): Promise<ResponseListItem[]> {
  return apiFetch<ResponseListItem[]>(`/api/forms/${formId}/responses`);
}

export async function getResponseDetail(formId: number, responseId: number): Promise<ResponseDetail> {
  return apiFetch<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`);
}

export async function getStatistics(formId: number): Promise<FormStatistics> {
  return apiFetch<FormStatistics>(`/api/forms/${formId}/statistics`);
}

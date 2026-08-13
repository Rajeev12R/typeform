import { apiFetch } from "./api";
import type { Form } from "../types/form";

export async function getPublicForm(publicId: string): Promise<Form> {
  return apiFetch<Form>(`/api/public/forms/${publicId}`);
}

export async function submitResponse(publicId: string, data: any): Promise<any> {
  return apiFetch(`/api/public/forms/${publicId}/responses`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

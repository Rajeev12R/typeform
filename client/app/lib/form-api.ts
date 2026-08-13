import { apiFetch } from "./api";
import type { Form } from "@/app/types/form";

export async function getForms(): Promise<Form[]> {
  return apiFetch<Form[]>("/api/forms");
}

export async function getForm(
  formId: number,
): Promise<Form> {
  return apiFetch<Form>(
    `/api/forms/${formId}`,
  );
}

export async function createForm(
  title: string,
): Promise<Form> {
  return apiFetch<Form>("/api/forms", {
    method: "POST",
    body: JSON.stringify({
      title,
    }),
  });
}

export async function updateForm(
  formId: number,
  title: string,
): Promise<Form> {
  return apiFetch<Form>(
    `/api/forms/${formId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title,
      }),
    },
  );
}

export async function deleteForm(
  formId: number,
): Promise<void> {
  return apiFetch<void>(
    `/api/forms/${formId}`,
    {
      method: "DELETE",
    },
  );
}

export async function publishForm(
  formId: number,
): Promise<Form> {
  return apiFetch<Form>(
    `/api/forms/${formId}/publish`,
    {
      method: "POST",
    },
  );
}

export async function unpublishForm(
  formId: number,
): Promise<Form> {
  return apiFetch<Form>(
    `/api/forms/${formId}/unpublish`,
    {
      method: "POST",
    },
  );
}

export async function duplicateForm(
  formId: number,
): Promise<Form> {
  return apiFetch<Form>(
    `/api/forms/${formId}/duplicate`,
    {
      method: "POST",
    },
  );
}
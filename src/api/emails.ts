import { apiRequest } from "./http";

interface ConfirmEmailResponse {
  data: { success: boolean; messageId: string };
}

export async function confirmEmailDraft(draftId: string): Promise<void> {
  await apiRequest<ConfirmEmailResponse>(`/emails/confirm/${draftId}`, {
    method: "POST",
  });
}

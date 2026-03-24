import { apiRequest } from "./http";

interface ResolveActionResponse {
  data: { success: boolean; message: string; data?: Record<string, unknown> };
}

export async function resolveAction(actionId: string, approved: boolean): Promise<ResolveActionResponse> {
  return apiRequest<ResolveActionResponse>(`/actions/${actionId}/resolve`, {
    method: "POST",
    body: { approved },
  });
}


export interface InputAddFavorite {
  projectId: string;
  userId: string;
  accountId: string;
  note?: string;
  context?: string;
}

export function buildAddFavoritePayload(
  projectId: string,
  userId: string,
  accountId: string,
  options?: { note?: string; context?: string }
): InputAddFavorite {
  return {
    projectId,
    userId,
    accountId,
    note: options?.note,
    context: options?.context,
  }
}
